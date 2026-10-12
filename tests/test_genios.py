import json
import unittest

from server.genios import GeniosClient


class GeniosClientTests(unittest.TestCase):
    def test_compacts_game_objects_before_workflow_call(self):
        context = {
            "stage": {
                "id": "clock",
                "title": "老校钟",
                "brief": "核验老校钟档案",
                "questions": [{"prompt": "不应随地图事件发送"}] * 12,
                "sprite": "assets/very-large-image.png",
            },
            "question": {
                "type": "choice",
                "prompt": "1937年老校钟经历了什么？",
                "options": ["失踪", "迁移"],
                "answer": 0,
                "explanation": "日军毁掠南开后失踪。",
                "image": "assets/archive.png",
            },
            "completed": 0,
        }
        compact = GeniosClient._compact_context(context)
        self.assertNotIn("questions", compact["stage"])
        self.assertNotIn("sprite", compact["stage"])
        self.assertNotIn("image", compact["question"])
        self.assertEqual(compact["question"]["prompt"], context["question"]["prompt"])
        self.assertEqual(compact["completed"], 0)

    def test_user_id_is_stable_and_within_platform_limit(self):
        first = GeniosClient.normalize_user_id("browser-user")
        self.assertEqual(first, GeniosClient.normalize_user_id("browser-user"))
        self.assertLessEqual(len(first), 20)

    def test_decodes_direct_agent_json(self):
        value = {"action": "introduce_game", "message": "欢迎", "evidence": []}
        self.assertEqual(GeniosClient._decode_response_text(json.dumps(value)), value)

    def test_decodes_nested_blocking_response(self):
        answer = json.dumps({"action": "explain_incorrect", "message": "答错啦", "evidence": ["校史"]})
        response = {"Data": json.dumps({"messages": [{"answer": answer}]})}
        decoded = GeniosClient._decode_response_text(json.dumps(response))
        self.assertEqual(decoded["message"], "答错啦")

    def test_decodes_workflow_raw_output(self):
        answer = {"action": "introduce_game", "message": "你好", "evidence": []}
        response = {"raw_output": json.dumps(answer, ensure_ascii=False)}
        self.assertEqual(GeniosClient._decode_response_text(json.dumps(response))["action"], "introduce_game")


if __name__ == "__main__":
    unittest.main()
