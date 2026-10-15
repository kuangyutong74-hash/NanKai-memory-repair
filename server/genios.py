"""NK-GeniOS API adapter with server-side-only credentials."""

from __future__ import annotations

import asyncio
import hashlib
import json
import os
import re
from typing import Any

import httpx
from dotenv import load_dotenv

load_dotenv()


class GeniosError(RuntimeError):
    """Raised when GeniOS returns an unusable response."""


class GeniosSafetyError(GeniosError):
    """Raised when two GeniOS replies both risk exposing an unsubmitted answer."""


class GeniosClient:
    STAGE_FIELDS = ("id", "title", "subtitle", "brief", "source", "chapterId")
    QUESTION_FIELDS = ("type", "text", "prompt", "options", "answer", "answerText", "answerOrder", "explanation")
    CHAPTER_FIELDS = ("id", "title", "subtitle", "rewardTitle")
    EVENT_NAMES = {
        "map-guide": "stage_intro",
        "route-locked": "route_locked",
        "question-intro": "question_intro",
        "clue": "clue_request",
        "answer-review": "answer_result",
        "stage-summary": "stage_complete",
        "chat-message": "chat_message",
    }

    def __init__(self) -> None:
        self.base_url = os.getenv(
            "GENIOS_API_BASE", "https://coze.nankai.edu.cn/api/proxy/api/v1"
        ).rstrip("/")
        self.api_key = os.getenv("GENIOS_API_KEY", "").strip()
        self.timeout = float(os.getenv("GENIOS_TIMEOUT_SECONDS", "30"))
        self._conversations: dict[str, str] = {}
        self._user_locks: dict[str, asyncio.Lock] = {}

    @property
    def configured(self) -> bool:
        return bool(self.api_key)

    @staticmethod
    def normalize_user_id(value: str) -> str:
        raw = str(value or "anonymous")
        return f"nk-{hashlib.sha256(raw.encode('utf-8')).hexdigest()[:16]}"

    @classmethod
    def _compact_record(cls, value: Any, fields: tuple[str, ...]) -> dict[str, Any]:
        if not isinstance(value, dict):
            return {}
        return {key: value[key] for key in fields if key in value}

    @classmethod
    def _compact_context(cls, context: dict[str, Any]) -> dict[str, Any]:
        compact: dict[str, Any] = {}
        stage_keys = {"stage", "targetStage", "prerequisite", "nextStage"}
        for key, value in context.items():
            if key in {"userId", "user_id"}:
                continue
            if key in stage_keys:
                compact[key] = cls._compact_record(value, cls.STAGE_FIELDS)
            elif key == "question":
                question = cls._compact_record(value, cls.QUESTION_FIELDS)
                if not context.get("questionSubmitted") and not context.get("reviewMode"):
                    for protected in ("answer", "answerText", "answerOrder", "explanation"):
                        question.pop(protected, None)
                compact[key] = question
            elif key == "targetChapter":
                compact[key] = cls._compact_record(value, cls.CHAPTER_FIELDS)
            elif isinstance(value, (str, int, float, bool)) or value is None:
                compact[key] = value
            elif isinstance(value, list) and len(value) <= 12 and all(
                isinstance(item, (str, int, float, bool)) or item is None for item in value
            ):
                compact[key] = value
        return compact

    @staticmethod
    def _normalized(value: Any) -> str:
        return re.sub(r"[\s，。！？、；：,.!?;:\-—_（）()《》“”'\"]+", "", str(value or "")).lower()

    @classmethod
    def _leaks_unsubmitted_answer(cls, reply: dict[str, Any], original_context: dict[str, Any]) -> bool:
        if original_context.get("questionSubmitted") or original_context.get("reviewMode"):
            return False
        question = original_context.get("question")
        if not isinstance(question, dict):
            return False
        text = cls._normalized(reply.get("text"))
        question_type = question.get("type")
        options = question.get("options") or []
        answer = question.get("answer")
        guard = original_context.get("answerGuard") if isinstance(original_context.get("answerGuard"), dict) else {}
        if question_type == "sort":
            answer_text = cls._normalized(question.get("answerText") or guard.get("answerText"))
            if answer_text and len(answer_text) >= 6 and answer_text in text:
                return True
            ordered_options = guard.get("answerOrder") or options
            normalized_options = [cls._normalized(option) for option in ordered_options if cls._normalized(option)]
            positions = [text.find(option) for option in normalized_options]
            return len(positions) >= 3 and all(position >= 0 for position in positions) and positions == sorted(positions)
        if question_type == "judge":
            direct_patterns = ("答案是正确", "答案是错误", "应该选择正确", "应该选择错误", "判断为正确", "判断为错误")
            return any(cls._normalized(pattern) in text for pattern in direct_patterns)
        if isinstance(answer, int) and 0 <= answer < len(options):
            correct_text = cls._normalized(options[answer])
            if correct_text and len(correct_text) >= 2 and correct_text in text:
                return True
            letter = chr(65 + answer)
            return bool(re.search(rf"(?:正确|答案|应选|选择)(?:选项)?[：:是为\s]*{letter}(?![A-Za-z])", str(reply.get("text") or ""), re.I))
        guarded_option = cls._normalized(guard.get("correctOption"))
        if guarded_option and len(guarded_option) >= 2 and guarded_option in text:
            return True
        guarded_letter = str(guard.get("correctLetter") or "").upper()
        if guarded_letter and re.search(rf"(?:正确|答案|应选|选择)(?:选项)?[：:是为\s]*{guarded_letter}(?![A-Za-z])", str(reply.get("text") or ""), re.I):
            return True
        raw_text = str(reply.get("text") or "")
        if re.search(r"(?:正确答案|答案|应选|选择)(?:是|为|：|:)?\s*(?:选项\s*)?[A-D](?![A-Za-z])", raw_text, re.I):
            return True
        return any(
            cls._normalized(marker) in text
            for marker in ("正确答案是", "答案应该是", "应当选择", "你应该选", "正确选项为")
        )

    @property
    def headers(self) -> dict[str, str]:
        return {"Apikey": self.api_key, "Content-Type": "application/json"}

    async def _post(self, path: str, payload: dict[str, Any]) -> httpx.Response:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/{path.lstrip('/')}",
                headers=self.headers,
                json=payload,
            )
        response.raise_for_status()
        return response

    async def create_conversation(self, user_id: str) -> str:
        response = await self._post(
            "create_conversation",
            {"UserID": user_id, "ConversationName": "南开记忆修复"},
        )
        try:
            value = response.json()["Conversation"]["AppConversationID"]
        except (KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
            raise GeniosError("GeniOS 创建会话响应缺少 AppConversationID") from exc
        if not value:
            raise GeniosError("GeniOS 返回了空会话 ID")
        return str(value)

    async def conversation_for(self, user_id: str) -> str:
        existing = self._conversations.get(user_id)
        if existing:
            return existing
        created = await self.create_conversation(user_id)
        self._conversations[user_id] = created
        return created

    @staticmethod
    def _find_answer(value: Any) -> str | None:
        if isinstance(value, dict):
            answer = value.get("answer") or value.get("Answer")
            if isinstance(answer, str) and answer.strip():
                return answer
            for nested_value in value.values():
                found = GeniosClient._find_answer(nested_value)
                if found:
                    return found
        elif isinstance(value, list):
            for item in reversed(value):
                found = GeniosClient._find_answer(item)
                if found:
                    return found
        return None

    @staticmethod
    def _decode_response_text(text: str) -> dict[str, Any] | None:
        stripped = text.strip()
        try:
            parsed = json.loads(stripped)
        except json.JSONDecodeError:
            parsed = None

        if isinstance(parsed, dict):
            if "action" in parsed and "message" in parsed:
                return parsed
            for key in ("raw_output", "output", "Data", "data"):
                nested_text = parsed.get(key)
                if isinstance(nested_text, str) and nested_text.strip() != stripped:
                    decoded = GeniosClient._decode_response_text(nested_text)
                    if decoded:
                        return decoded
            answer = GeniosClient._find_answer(parsed)
            if answer:
                return GeniosClient._decode_response_text(answer)

        chunks: list[str] = []
        for line in stripped.splitlines():
            if not line.startswith("data:"):
                continue
            candidate = line[5:].strip()
            if candidate.startswith("data:"):
                candidate = candidate[5:].strip()
            try:
                event = json.loads(candidate)
            except json.JSONDecodeError:
                continue
            if event.get("event") in {"message", "message_end"} and event.get("answer"):
                chunks.append(str(event["answer"]))
        if chunks:
            return GeniosClient._decode_response_text("".join(chunks))
        return None

    async def send_event(self, event: str, context: dict[str, Any]) -> dict[str, Any]:
        if not self.configured:
            raise GeniosError("GENIOS_API_KEY 未配置")

        browser_user_id = str(context.get("userId") or context.get("user_id") or "anonymous")
        user_id = self.normalize_user_id(browser_user_id)
        workflow_event = self.EVENT_NAMES.get(event, event.replace("-", "_"))
        if event == "stage-summary" and context.get("chapterComplete"):
            workflow_event = "chapter_complete"
        compact_context = self._compact_context(context)
        if event == "chat-message" and not context.get("questionSubmitted") and not context.get("reviewMode"):
            compact_context["answerPolicy"] = (
                "当前题目尚未提交。请只提供与hintLevel相符的线索，不要直接说出正确选项、正确序号、判断结果或完整排序。"
            )
        elif event == "chat-message" and (context.get("questionSubmitted") or context.get("reviewMode")):
            compact_context["answerPolicy"] = "当前处于回顾模式，可以解释正确答案及其校史背景。"
        if event == "chat-message":
            compact_context["responsePolicy"] = (
                "校史、人物、建筑和年代必须优先依据现有RAG档案；没有可靠资料时明确说现有档案中暂时没有足够证据，不得编造。"
                "普通关卡提示尽量不超过120字，校史问答尽量不超过240字；游戏规则只依据传入的gameRules。"
            )
            question_record = compact_context.get("question") if isinstance(compact_context.get("question"), dict) else {}
            # 保留现有工作流曾使用的扁平字段命名，同时继续传递完整结构化上下文。
            compact_context["chapter_title"] = str(compact_context.get("chapter") or "")
            compact_context["stage_title"] = str(compact_context.get("landmark") or "")
            compact_context["question_text"] = str(question_record.get("text") or question_record.get("prompt") or "")
            compact_context["query"] = " ".join(
                value for value in (
                    str(compact_context.get("playerQuestion") or ""),
                    compact_context["chapter_title"],
                    compact_context["stage_title"],
                    compact_context["question_text"],
                ) if value
            )
        event_payload = {"event": workflow_event, **compact_context}
        lock = self._user_locks.setdefault(user_id, asyncio.Lock())
        async with lock:
            conversation_id = await self.conversation_for(user_id)
            query_payload = {
                "UserID": user_id,
                "AppConversationID": conversation_id,
                "Query": json.dumps(event_payload, ensure_ascii=False),
                "ResponseMode": "blocking",
            }
            response = await self._query_with_stale_session_retry(user_id, query_payload)
            decoded = self._decode_response_text(response.text)
            if decoded:
                provisional = self._format_reply(decoded, event, workflow_event)
                if event == "chat-message" and self._leaks_unsubmitted_answer(provisional, context):
                    event_payload["safetyRetry"] = True
                    event_payload["answerPolicy"] = (
                        "上一次内容可能泄露答案。请重新生成，只给观察方向、档案证据或最多排除一个错误信息；"
                        "不得出现正确选项文本、字母序号、判断结论或完整排序。"
                    )
                    query_payload["Query"] = json.dumps(event_payload, ensure_ascii=False)
                    response = await self._query_with_stale_session_retry(user_id, query_payload)
                    decoded = self._decode_response_text(response.text)
        if not decoded:
            raise GeniosError("无法从 GeniOS 响应中解析智能体 JSON")
        reply = self._format_reply(decoded, event, workflow_event)
        if event == "chat-message" and self._leaks_unsubmitted_answer(reply, context):
            raise GeniosSafetyError("荷宝正在重新整理线索，请稍后再试")
        return reply

    async def _query_with_stale_session_retry(self, user_id: str, query_payload: dict[str, Any]) -> httpx.Response:
        try:
            return await self._post("chat_query", query_payload)
        except httpx.HTTPStatusError:
            self._conversations.pop(user_id, None)
            query_payload["AppConversationID"] = await self.conversation_for(user_id)
            return await self._post("chat_query", query_payload)

    @staticmethod
    def _format_reply(decoded: dict[str, Any], event: str, workflow_event: str) -> dict[str, Any]:
        evidence = decoded.get("evidence") or []
        if not isinstance(evidence, list):
            evidence = [evidence]
        return {
            "speaker": "荷宝",
            "text": str(decoded.get("message") or ""),
            "citations": [
                {"label": str(item.get("label") if isinstance(item, dict) else item)}
                for item in evidence
                if item
            ],
            "meta": {
                "intent": event,
                "workflowEvent": workflow_event,
                "action": decoded.get("action"),
                "reason": decoded.get("reason"),
                "target": decoded.get("target"),
            },
        }

    def reset_conversation(self, browser_user_id: str) -> None:
        self._conversations.pop(self.normalize_user_id(browser_user_id), None)


genios = GeniosClient()
