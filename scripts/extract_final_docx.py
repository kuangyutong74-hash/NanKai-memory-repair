from __future__ import annotations

import json
import re
import shutil
import zipfile
from pathlib import Path

from docx import Document


ROOT = Path(__file__).resolve().parents[2]
PROJECT = ROOT / "nankai-memory-repair"
DOCX = ROOT / "南开记忆修复计划_校史题库_定稿版_49题 .docx"
ASSET_DIR = PROJECT / "assets" / "final-bank"
OUTPUT = PROJECT / "content-data.js"

STAGE_IDS = [
    "bell", "siyuan", "xiushan", "mati", "library",
    "xinkai", "haibing", "wenzhong", "main",
    "zhou", "lianda", "yifu", "today", "three",
]
SPRITES = {
    "bell": "landmark-bell.png", "siyuan": "landmark-siyuan.png",
    "xiushan": "landmark-xiushan.png", "mati": "landmark-mati.png",
    "library": "landmark-muzhai.png", "xinkai": "landmark-xinkai.png",
    "haibing": "landmark-haibing.png", "wenzhong": "landmark-wenzhong.png",
    "main": "landmark-main-zhou.png", "zhou": "landmark-main-zhou.png",
    "lianda": "landmark-lianda-memorial.png", "yifu": "landmark-yifu.png",
    "today": "landmark-jinnan-library.png", "three": "landmark-three.png",
}
BACKGROUNDS = {
    "origin": "assets/campus-empty-origin-v2.png",
    "rebuild": "assets/campus-empty-rebuild.png",
    "renewal": "assets/campus-empty-renewal.png",
}
CHAPTER_IDS = ["origin", "rebuild", "renewal"]
MAP_POSITIONS = {
    "origin": [[20, 20], [20, 73], [72, 18], [45, 20], [76, 72]],
    "rebuild": [[20, 18], [72, 18], [24, 72], [68, 72]],
    "renewal": [[24, 16], [50, 15], [74, 16], [31, 73], [67, 72]],
}


def paragraph_image(document: Document, paragraph) -> tuple[str, str] | None:
    relation_ids = paragraph._p.xpath(".//a:blip/@r:embed")
    if not relation_ids:
        return None
    relation = document.part.rels[relation_ids[0]]
    return relation.target_ref.split("/")[-1], relation_ids[0]


def clean_title(value: str) -> str:
    return re.sub(r"^\d{2}[　\s]+", "", value).strip()


def next_text(paragraphs, start: int, end: int) -> str:
    for index in range(start, end):
        text = paragraphs[index].text.strip()
        if text:
            return text
    return ""


def main() -> None:
    document = Document(DOCX)
    paragraphs = document.paragraphs
    images: dict[int, str] = {}
    with zipfile.ZipFile(DOCX) as archive:
        ASSET_DIR.mkdir(parents=True, exist_ok=True)
        for index, paragraph in enumerate(paragraphs):
            found = paragraph_image(document, paragraph)
            if not found:
                continue
            media_name, _ = found
            target = ASSET_DIR / media_name
            if not target.exists():
                with archive.open(f"word/media/{media_name}") as source, target.open("wb") as destination:
                    shutil.copyfileobj(source, destination)
            images[index] = f"assets/final-bank/{media_name}"

    chapter_starts = [i for i, p in enumerate(paragraphs) if p.text.strip().startswith("阶段") and "·" in p.text and "（" in p.text]
    building_starts = [i for i, p in enumerate(paragraphs) if re.match(r"^\d{2}[　\s]+\S", p.text.strip())]
    question_starts = [i for i, p in enumerate(paragraphs) if re.match(r"^[ABC]\d{2}-\d+[　\s]+(?:单选|判断|排序)", p.text.strip())]
    stages = []

    for stage_number, start in enumerate(building_starts):
        end = building_starts[stage_number + 1] if stage_number + 1 < len(building_starts) else next((i for i in range(start, len(paragraphs)) if paragraphs[i].text.strip().startswith("附录一")), len(paragraphs))
        stage_id = STAGE_IDS[stage_number]
        title = clean_title(paragraphs[start].text.strip())
        meta = paragraphs[start + 1].text.strip()
        guide = paragraphs[start + 2].text.strip()
        chapter_index = 0 if stage_number < 5 else 1 if stage_number < 9 else 2
        chapter_id = CHAPTER_IDS[chapter_index]
        question_indexes = [i for i in question_starts if start < i < end]
        story_index = next((i for i in range(start, end) if paragraphs[i].text.strip() == "通关故事"), end)
        questions = []
        for q_pos, q_start in enumerate(question_indexes):
            q_end = question_indexes[q_pos + 1] if q_pos + 1 < len(question_indexes) else story_index
            header = paragraphs[q_start].text.strip()
            match = re.match(r"^([ABC]\d{2}-\d+)[　\s]+(单选|判断|排序)\s*·\s*([^·]+)\s*·\s*(.+)$", header)
            code, kind, difficulty, category = match.groups() if match else (header.split()[0], "单选", "简单", "校史")
            option_rows = []
            answer_text = ""
            explanation = ""
            clue = ""
            source = ""
            answer_seen = False
            question_image = next((images[i] for i in range(q_start + 1, q_end) if i in images), "")
            image_index = next((i for i in range(q_start + 1, q_end) if i in images), -1)
            image_caption = next_text(paragraphs, image_index + 1, q_end) if image_index >= 0 else ""
            text_parts = []
            for index in range(q_start + 1, q_end):
                text = paragraphs[index].text.strip()
                if not text or index in images or index == image_index + 1 or text.startswith("（以下为打乱后的顺序"):
                    continue
                option = re.match(r"^([A-D])\.\s*(.+)$", text)
                if option and not answer_seen:
                    option_rows.append((option.group(1), option.group(2)))
                elif text.startswith("答案："):
                    answer_seen = True
                    answer_text = text.removeprefix("答案：").strip()
                elif text.startswith("解析："):
                    explanation = text.removeprefix("解析：").strip()
                elif text.startswith("档案线索"):
                    clue = text.split("：", 1)[-1].strip()
                elif text.startswith("出处："):
                    source = text.removeprefix("出处：").strip()
                elif not option_rows and not text.startswith(("错项辨析", "互动建议")):
                    text_parts.append(text)
            labels = [label for label, _ in option_rows]
            options = [value for _, value in option_rows]
            answer_letters = re.findall(r"\b([A-D])\b", answer_text.split("（", 1)[0])
            answer_order = [labels.index(letter) for letter in answer_letters if letter in labels]
            answer = answer_order[0] if answer_order else 0
            questions.append({
                "code": code, "type": {"单选": "choice", "判断": "judge", "排序": "sort"}[kind],
                "difficulty": difficulty.strip(), "category": category.strip(), "text": "".join(text_parts),
                "options": options, "answer": answer, "answerOrder": answer_order,
                "answerText": answer_text, "explanation": explanation, "clue": clue, "source": source,
                "image": question_image, "imageCaption": image_caption,
            })

        story_image_index = next((i for i in range(story_index + 1, end) if i in images), -1)
        story_image = images.get(story_image_index, "")
        story_caption = next_text(paragraphs, story_image_index + 1, end) if story_image_index >= 0 else ""
        story = ""
        story_source = ""
        for index in range(max(story_index + 1, story_image_index + 2), end):
            text = paragraphs[index].text.strip()
            if not text:
                continue
            if text.startswith("出处：") and not story_source:
                story_source = text.removeprefix("出处：").strip()
                continue
            if text.startswith(("补充故事", "通关互动", "阶段通关")):
                break
            if not story and not text.startswith("配图："):
                story = text

        x, y = MAP_POSITIONS[chapter_id][stage_number if chapter_index == 0 else stage_number - 5 if chapter_index == 1 else stage_number - 9]
        stages.append({
            "id": stage_id, "title": title, "subtitle": f"走进{title}，核验定稿校史档案",
            "brief": guide.split("：", 1)[-1], "year": re.search(r"（([^）]+)）", paragraphs[chapter_starts[chapter_index]].text.strip()).group(1),
            "storyTitle": story_caption.split("（", 1)[0] or f"{title}校史回顾", "story": story,
            "source": story_source or next((q["source"] for q in questions if q["source"]), "定稿校史题库"),
            "storyImage": story_image, "storyCaption": story_caption,
            "sprite": f"assets/{SPRITES[stage_id]}", "chapterId": chapter_id,
            "x": x, "y": y, "walkX": x, "walkY": 43 if y < 50 else 91,
            "meta": meta, "questions": questions,
        })

    chapters = []
    chapter_stage_slices = [stages[:5], stages[5:9], stages[9:]]
    for chapter_index, start in enumerate(chapter_starts):
        end = chapter_starts[chapter_index + 1] if chapter_index + 1 < len(chapter_starts) else len(paragraphs)
        heading = paragraphs[start].text.strip()
        match = re.match(r"^阶段[一二三]\s*·\s*(.+)（([^）]+)）", heading)
        title, period = match.groups()
        reward_image_index = next(i for i in range(start, end) if i in images)
        reward_caption = next_text(paragraphs, reward_image_index + 1, end)
        chapter_stages = chapter_stage_slices[chapter_index]
        chapters.append({
            "id": CHAPTER_IDS[chapter_index], "title": title, "period": period,
            "subtitle": period, "background": BACKGROUNDS[CHAPTER_IDS[chapter_index]],
            "stageIds": [stage["id"] for stage in chapter_stages],
            "introTitle": title, "introText": f"沿着{title}的校园地标，核验档案、修复影像，重新拼合这一时期的南开记忆。",
            "highlights": [stage["title"] for stage in chapter_stages[:4]],
            "quote": f"本章任务：完成{len(chapter_stages)}处地标档案核验，拼合阶段照片。",
            "rewardTitle": reward_caption.split("（", 1)[0], "rewardImage": images[reward_image_index],
            "rewardCaption": reward_caption, "fragmentStageIds": [stage["id"] for stage in chapter_stages],
            "fragmentNames": (["左上角", "右上角", "中部左侧", "中部右侧", "底部全景"] if len(chapter_stages) == 5 else ["左上角", "右上角", "左下角", "右下角"]),
        })

    payload = {"stageCatalog": stages, "chapters": chapters}
    OUTPUT.write_text("const contentData = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    question_count = sum(len(stage["questions"]) for stage in stages)
    print(f"Wrote {OUTPUT} with {len(stages)} stages, {question_count} questions and {len(images)} image placements")
    if question_count != 49:
        raise SystemExit(f"Expected 49 questions, got {question_count}")


if __name__ == "__main__":
    main()
