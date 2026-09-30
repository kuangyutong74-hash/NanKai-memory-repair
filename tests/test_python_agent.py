import unittest

from server.agent import HebaoAgent, tokenize
from server.game_data import CHAPTERS, chapter_payload


class HebaoAgentTests(unittest.TestCase):
    def setUp(self) -> None:
        self.agent = HebaoAgent()

    def test_chinese_bigram_tokenization(self) -> None:
        self.assertIn("校钟", tokenize("校钟1919"))

    def test_bell_query_prefers_bell_archive(self) -> None:
        result = self.agent.retrieve("校钟铭文 文以治国 理以强国 商以富国", "bell")
        self.assertEqual("culture-bell", result[0].chunk["id"])

    def test_clue_has_verified_citation(self) -> None:
        response = self.agent.respond("clue", {
            "stage": {"id": "three", "title": "爱国三问碑"},
            "question": {"text": "爱国三问由谁提出？", "clue": "他也是南开大学首任校长。"},
        })
        self.assertTrue(response["citations"])

    def test_three_chapters_and_fourteen_stages(self) -> None:
        payload = chapter_payload()
        self.assertEqual(3, len(CHAPTERS))
        self.assertEqual(14, sum(len(item["stages"]) for item in payload))

    def test_locked_route_names_prerequisite_and_current_stage(self) -> None:
        response = self.agent.respond("route-locked", {
            "targetType": "chapter",
            "targetChapter": {"title": "1949—1978"},
            "prerequisite": {"title": "木斋图书馆"},
            "nextStage": {"title": "老校钟"},
        })
        self.assertIn("木斋图书馆", response["text"])
        self.assertIn("老校钟", response["text"])
        self.assertEqual("route-locked", response["meta"]["intent"])

    def test_chapter_completion_mentions_full_reward(self) -> None:
        response = self.agent.respond("stage-summary", {
            "stage": {"id": "library", "title": "木斋图书馆"},
            "correct": 3,
            "chapterComplete": True,
            "rewardTitle": "南开大学开学典礼照片",
            "fragmentName": "底部全景",
        })
        self.assertIn("完整拼合", response["text"])
        self.assertIn("开学典礼照片", response["text"])


if __name__ == "__main__":
    unittest.main()
