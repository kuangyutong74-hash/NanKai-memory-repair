"""荷宝智能体：可解释的本地 RAG + 主动引导策略。

核心规则：只依据提供的档案切片；引用必须来自本轮检索结果；资料不足时明确降级。
"""

from __future__ import annotations

import math
import re
from collections import Counter
from dataclasses import dataclass
from typing import Any

HAN_RUN_RE = re.compile(r"[\u4e00-\u9fff]+")
WORD_RE = re.compile(r"[A-Za-z0-9_-]{2,}")


KNOWLEDGE = [
    {"id": "history-origin", "documentTitle": "南开校史讲义", "sectionTitle": "第一章 创校与早期发展", "stageIds": ["siyuan", "main", "mati", "xiushan"], "content": "南开大学创办于1919年，创办者是严修与张伯苓。1919年9月举行开学典礼，第一期学生共96人。周恩来1919年入南开大学文科，学号62号。"},
    {"id": "history-disciplines", "documentTitle": "南开校史讲义", "sectionTitle": "第一章 创校与早期发展", "stageIds": ["bell", "siyuan"], "content": "南开大学创办之初设立文、理、商三科，其后增设矿科，与文以治国、理以强国、商以富国的办学追求相呼应。"},
    {"id": "culture-bell", "documentTitle": "南开校园文化读本", "sectionTitle": "第二章 校名与校园标识", "stageIds": ["bell"], "content": "南开大学校钟铭文以文以治国、理以强国、商以富国表达办学追求，体现文、理、商并重的理念。"},
    {"id": "spirit-motto", "documentTitle": "南开校史讲义", "sectionTitle": "第四章 精神传统", "stageIds": ["bell", "three"], "content": "南开大学校训是允公允能、日新月异。公指爱国爱群之公德，能指服务社会之能力。"},
    {"id": "spirit-three", "documentTitle": "南开校史讲义", "sectionTitle": "第四章 精神传统", "stageIds": ["three"], "content": "1935年张伯苓提出爱国三问：你是中国人吗？你爱中国吗？你愿意中国好吗？"},
    {"id": "history-destroyed", "documentTitle": "南开校史讲义", "sectionTitle": "第二章 抗战内迁与西南联大", "stageIds": ["library", "lianda"], "content": "1937年7月日军炮击轰炸南开大学校园，图书馆、教学楼等校舍严重被毁，师生组织南迁。"},
    {"id": "history-lianda", "documentTitle": "南开校史讲义", "sectionTitle": "第二章 抗战内迁与西南联大", "stageIds": ["library", "lianda"], "content": "1937年北大、清华、南开先在长沙组成国立长沙临时大学；1938年三校在昆明组建国立西南联合大学，校训为刚毅坚卓。"},
    {"id": "history-rebuild", "documentTitle": "南开校史讲义", "sectionTitle": "第一章 创校与早期发展", "stageIds": ["xinkai", "haibing", "wenzhong", "main"], "content": "1946年南开大学改为国立并在天津八里台复校。1952年院系调整后，南开大学被定位为文理综合大学。"},
    {"id": "history-zhou", "documentTitle": "南开校史讲义", "sectionTitle": "第一章 创校与早期发展", "stageIds": ["zhou"], "content": "周恩来1919年进入南开大学文科，是第一期学生，学号62号，1920年赴法勤工俭学。"},
    {"id": "history-today", "documentTitle": "南开校史讲义", "sectionTitle": "第一章 创校与早期发展", "stageIds": ["yifu", "today"], "content": "2015年津南校区启用，南开形成八里台与津南并行的办学格局。2019年南开大学迎来建校100周年。"},
]


def tokenize(text: str) -> list[str]:
    lowered = str(text or "").lower()
    tokens = WORD_RE.findall(lowered)
    for run in HAN_RUN_RE.findall(lowered):
        tokens.extend(run)
        tokens.extend(run[index:index + 2] for index in range(len(run) - 1))
    return tokens


@dataclass
class Retrieved:
    chunk: dict[str, Any]
    score: float

    def citation(self) -> dict[str, str]:
        return {
            "id": self.chunk["id"],
            "label": f"依据：《{self.chunk['documentTitle']}》· {self.chunk['sectionTitle']}",
        }


class HebaoAgent:
    def __init__(self, chunks: list[dict[str, Any]] | None = None) -> None:
        self.chunks = chunks or KNOWLEDGE
        self.documents: list[tuple[dict[str, Any], Counter[str], int]] = []
        self.df: Counter[str] = Counter()
        for chunk in self.chunks:
            heading = f"{chunk['documentTitle']} {chunk['sectionTitle']}"
            terms = tokenize(chunk["content"]) + tokenize(heading) * 2
            counts = Counter(terms)
            self.documents.append((chunk, counts, max(1, len(terms))))
            self.df.update(counts.keys())
        self.average_length = sum(item[2] for item in self.documents) / max(1, len(self.documents))

    def retrieve(self, query: str, stage_id: str = "", top_k: int = 2) -> list[Retrieved]:
        query_terms = Counter(tokenize(query))
        total = max(1, len(self.documents))
        ranked: list[Retrieved] = []
        for chunk, counts, length in self.documents:
            score = 0.0
            for term, query_frequency in query_terms.items():
                frequency = counts.get(term, 0)
                if not frequency:
                    continue
                inverse_frequency = math.log(1 + (total - self.df[term] + .5) / (self.df[term] + .5))
                denominator = frequency + 1.5 * (.25 + .75 * length / self.average_length)
                score += inverse_frequency * frequency * 2.5 / denominator * min(query_frequency, 3)
            if stage_id and stage_id in chunk.get("stageIds", []):
                score += 1.2
            if score > 0:
                ranked.append(Retrieved(chunk, score))
        ranked.sort(key=lambda item: item.score, reverse=True)
        return ranked[:top_k]

    def respond(self, event: str, context: dict[str, Any]) -> dict[str, Any]:
        stage = context.get("stage") or {}
        question = context.get("question") or {}
        stage_id = str(stage.get("id") or "")
        query = " ".join(str(value) for value in [stage.get("title"), question.get("text"), question.get("clue"), question.get("explanation")] if value)
        retrieved = self.retrieve(query, stage_id)
        citations = [item.citation() for item in retrieved]

        if event == "map-guide":
            if context.get("completed", 0) >= context.get("total", 1):
                text = "三个章节的校史影像已全部归档。你找回的不只是一册照片，也是南开人在时代中的选择。"
            elif context.get("travelling"):
                text = f"上一块照片碎片已经收入档案册。我们正在前往{stage.get('title', '下一处地标')}。"
            else:
                text = (
                    f"当前任务：{stage.get('title', '校史地标')}。完成档案核验后，"
                    f"可获得“{context.get('rewardTitle', '本章照片')}”的{context.get('fragmentName', '一块碎片')}。"
                    f"本章已收集{context.get('chapterCollected', 0)}/{context.get('chapterTotal', 1)}块。"
                )
            citations = []
        elif event == "route-locked":
            target_stage = context.get("targetStage") or {}
            target_chapter = context.get("targetChapter") or {}
            prerequisite = context.get("prerequisite") or {}
            next_stage = context.get("nextStage") or {}
            if context.get("targetType") == "chapter":
                text = (
                    f"“{target_chapter.get('title', '后续章节')}”还没有解锁。"
                    f"你可以先查看这张地图和地标样式，但暂时不能进入关卡体验。"
                    f"请先完成“{prerequisite.get('title', '当前章节最后一站')}”的影像修复，"
                    f"现在应继续前往“{next_stage.get('title', '当前地标')}”。"
                )
            else:
                text = (
                    f"“{target_stage.get('title', '这处地标')}”的档案仍处于锁定状态。"
                    f"请先完成“{prerequisite.get('title', '上一处地标')}”，"
                    f"现在应继续前往“{next_stage.get('title', '当前地标')}”。"
                )
            citations = []
        elif event == "question-intro":
            if context.get("questionIndex", 0) == 0:
                text = "这是档案选择题。点击一座档案台选择答案，再点击“确认核验”；题干里的时间、人物和地点是重要线索。"
            elif context.get("questionIndex", 0) == 1:
                text = "这是判断题。读完陈述后，认为符合校史记录就选“正确”，认为不符合就选“错误”，然后确认答案。"
            else:
                text = "这是时间排序题。把下方四份档案拖到上方1—4号位置，按年份从早到晚排列；手机上也可以先点档案箱，再点目标位置。"
            if context.get("wrongStreak", 0) >= 2:
                text += " 你连续遇到了两处冲突记录，这一题我会提供额外辅助。"
        elif event == "nudge":
            text = "我注意到你停留了一会儿。先锁定题干中的时间、人物或地点；仍然犹豫时，可以调阅一条低提示度线索。"
        elif event == "clue":
            text = f"档案线索：{question.get('clue', '请对照题干中的时间与人物。')}"
        elif event == "answer-review":
            if context.get("right") and context.get("clueUsed"):
                text = "你利用线索完成了交叉印证，这正是档案研究的基本方法。"
            elif context.get("right"):
                text = "没有调用线索也完成了核验。下一题会提高一点信息密度。"
            elif context.get("wrongStreak", 0) >= 2:
                text = "两次误判集中在相近信息上。下一题我会排除一项干扰记录，帮你重新建立时间线。"
            else:
                text = "解释已经指出冲突的档案信息，带着它继续核验。"
        elif event == "stage-summary":
            if context.get("chapterComplete"):
                text = f"本章所有档案均已核验，“{context.get('rewardTitle', '章节影像')}”的碎片已经完整拼合并正式归档。"
            elif context.get("correct") == 3:
                text = f"你完整辨认了本关的时间、人物与事件，已取得照片的{context.get('fragmentName', '对应区域')}。"
            else:
                text = f"你已掌握本关主线，照片的{context.get('fragmentName', '对应区域')}已经收入档案册。"
        elif event == "retry":
            text = "本轮只完成了部分核验。取得照片碎片至少需要通过2份档案，我们带着刚才的解释再核对一次。"
            citations = []
        else:
            text = "目前的档案片段不足以处理这个请求。"

        return {"speaker": "荷宝", "text": text, "citations": citations, "meta": {"intent": event}}


agent = HebaoAgent()
