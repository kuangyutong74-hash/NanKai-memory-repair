"""NK-GeniOS API adapter with server-side-only credentials."""

from __future__ import annotations

import asyncio
import hashlib
import json
import os
from typing import Any

import httpx
from dotenv import load_dotenv

load_dotenv()


class GeniosError(RuntimeError):
    """Raised when GeniOS returns an unusable response."""


class GeniosClient:
    STAGE_FIELDS = ("id", "title", "subtitle", "brief", "source", "chapterId")
    QUESTION_FIELDS = (
        "type", "prompt", "options", "answer", "answerText", "answerOrder", "explanation"
    )
    CHAPTER_FIELDS = ("id", "title", "subtitle", "rewardTitle")
    EVENT_NAMES = {
        "map-guide": "stage_intro",
        "route-locked": "route_locked",
        "question-intro": "question_intro",
        "clue": "clue_request",
        "answer-review": "answer_result",
        "stage-summary": "stage_complete",
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
                compact[key] = cls._compact_record(value, cls.QUESTION_FIELDS)
            elif key == "targetChapter":
                compact[key] = cls._compact_record(value, cls.CHAPTER_FIELDS)
            elif isinstance(value, (str, int, float, bool)) or value is None:
                compact[key] = value
            elif isinstance(value, list) and len(value) <= 12 and all(
                isinstance(item, (str, int, float, bool)) or item is None for item in value
            ):
                compact[key] = value
        return compact

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
        event_payload = {"event": workflow_event, **self._compact_context(context)}
        lock = self._user_locks.setdefault(user_id, asyncio.Lock())
        async with lock:
            conversation_id = await self.conversation_for(user_id)
            query_payload = {
                "UserID": user_id,
                "AppConversationID": conversation_id,
                "Query": json.dumps(event_payload, ensure_ascii=False),
                "ResponseMode": "blocking",
            }
            try:
                response = await self._post("chat_query", query_payload)
            except httpx.HTTPStatusError:
                self._conversations.pop(user_id, None)
                query_payload["AppConversationID"] = await self.conversation_for(user_id)
                response = await self._post("chat_query", query_payload)
        decoded = self._decode_response_text(response.text)
        if not decoded:
            raise GeniosError("无法从 GeniOS 响应中解析智能体 JSON")
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


genios = GeniosClient()
