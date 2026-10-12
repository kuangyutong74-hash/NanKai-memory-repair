import tempfile
import unittest
from pathlib import Path

from server import auth


class AuthStorageTests(unittest.TestCase):
    def setUp(self):
        self.tempdir = tempfile.TemporaryDirectory()
        self.original_path = auth.DB_PATH
        auth.DB_PATH = Path(self.tempdir.name) / "test.db"
        auth.initialize()

    def tearDown(self):
        auth.DB_PATH = self.original_path
        self.tempdir.cleanup()

    def test_register_login_and_save_round_trip(self):
        registration = auth.register("修复员001", "archive-1919", "小南")
        user = auth.user_for_token(registration["token"])
        self.assertEqual(user["displayName"], "小南")

        saved = auth.save_progress(user["id"], ["origin-bell", "origin-bell", "origin-library"])
        self.assertEqual(saved["completed"], ["origin-bell", "origin-library"])
        self.assertEqual(auth.load_save(user["id"])["completed"], saved["completed"])

        login = auth.login("修复员001", "archive-1919")
        self.assertEqual(login["user"]["username"], "修复员001")

    def test_duplicate_username_and_wrong_password_are_rejected(self):
        auth.register("nankai_user", "archive-1919", "荷花")
        with self.assertRaises(auth.AuthError):
            auth.register("NANKAI_USER", "another-pass", "荷叶")
        with self.assertRaises(auth.AuthError):
            auth.login("nankai_user", "wrong-pass")


if __name__ == "__main__":
    unittest.main()
