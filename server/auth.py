"""本地账号、会话与云端游戏存档。

比赛原型默认使用 SQLite，密码只保存 PBKDF2 哈希，浏览器仅持有随机会话令牌。
"""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).absolute().parents[1]
DB_PATH = Path(os.getenv("NANKAI_GAME_DB", ROOT / "data" / "nankai-memory.db"))
USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9_\u4e00-\u9fff]{3,20}$")
SESSION_DAYS = 30


class AuthError(ValueError):
    """可安全展示给用户的账号错误。"""


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def initialize() -> None:
    with _connect() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE COLLATE NOCASE,
                display_name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sessions (
                token_hash TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS saves (
                user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                completed_json TEXT NOT NULL DEFAULT '[]',
                updated_at TEXT NOT NULL
            );
            """
        )


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _timestamp(value: datetime | None = None) -> str:
    return (value or _now()).isoformat()


def _hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 210_000)
    return f"pbkdf2_sha256$210000${salt.hex()}${derived.hex()}"


def _verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, iterations, salt_hex, expected_hex = encoded.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        actual = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), bytes.fromhex(salt_hex), int(iterations)
        )
        return hmac.compare_digest(actual, bytes.fromhex(expected_hex))
    except (TypeError, ValueError):
        return False


def _public_user(row: sqlite3.Row) -> dict[str, Any]:
    return {"id": row["id"], "username": row["username"], "displayName": row["display_name"]}


def _issue_session(connection: sqlite3.Connection, user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    now = _now()
    connection.execute("DELETE FROM sessions WHERE expires_at <= ?", (_timestamp(now),))
    connection.execute(
        "INSERT INTO sessions(token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
        (token_hash, user_id, _timestamp(now + timedelta(days=SESSION_DAYS)), _timestamp(now)),
    )
    return token


def register(username: str, password: str, display_name: str) -> dict[str, Any]:
    username = username.strip()
    display_name = display_name.strip()
    if not USERNAME_PATTERN.fullmatch(username):
        raise AuthError("账号需为3—20位中文、字母、数字或下划线")
    if len(password) < 8 or len(password) > 72:
        raise AuthError("密码需为8—72位")
    if not display_name or len(display_name) > 20:
        raise AuthError("修复员姓名需为1—20位")
    now = _timestamp()
    try:
        with _connect() as connection:
            cursor = connection.execute(
                "INSERT INTO users(username, display_name, password_hash, created_at) VALUES (?, ?, ?, ?)",
                (username, display_name, _hash_password(password), now),
            )
            connection.execute(
                "INSERT INTO saves(user_id, completed_json, updated_at) VALUES (?, '[]', ?)",
                (cursor.lastrowid, now),
            )
            token = _issue_session(connection, int(cursor.lastrowid))
            row = connection.execute("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
    except sqlite3.IntegrityError as exc:
        raise AuthError("这个账号已经被登记，请直接登录") from exc
    return {"token": token, "user": _public_user(row)}


def login(username: str, password: str) -> dict[str, Any]:
    with _connect() as connection:
        row = connection.execute("SELECT * FROM users WHERE username = ?", (username.strip(),)).fetchone()
        if row is None or not _verify_password(password, row["password_hash"]):
            raise AuthError("账号或密码不正确")
        token = _issue_session(connection, int(row["id"]))
    return {"token": token, "user": _public_user(row)}


def user_for_token(token: str) -> dict[str, Any] | None:
    if not token:
        return None
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    with _connect() as connection:
        row = connection.execute(
            """SELECT users.* FROM sessions
               JOIN users ON users.id = sessions.user_id
               WHERE sessions.token_hash = ? AND sessions.expires_at > ?""",
            (token_hash, _timestamp()),
        ).fetchone()
    return _public_user(row) if row else None


def revoke(token: str) -> None:
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    with _connect() as connection:
        connection.execute("DELETE FROM sessions WHERE token_hash = ?", (token_hash,))


def load_save(user_id: int) -> dict[str, Any]:
    with _connect() as connection:
        row = connection.execute("SELECT * FROM saves WHERE user_id = ?", (user_id,)).fetchone()
    if not row:
        return {"completed": [], "updatedAt": None}
    try:
        completed = json.loads(row["completed_json"])
    except json.JSONDecodeError:
        completed = []
    return {"completed": completed if isinstance(completed, list) else [], "updatedAt": row["updated_at"]}


def save_progress(user_id: int, completed: list[str]) -> dict[str, Any]:
    clean = list(dict.fromkeys(item for item in completed if isinstance(item, str) and len(item) <= 60))[:50]
    updated_at = _timestamp()
    with _connect() as connection:
        connection.execute(
            """INSERT INTO saves(user_id, completed_json, updated_at) VALUES (?, ?, ?)
               ON CONFLICT(user_id) DO UPDATE SET completed_json = excluded.completed_json,
               updated_at = excluded.updated_at""",
            (user_id, json.dumps(clean, ensure_ascii=False), updated_at),
        )
    return {"completed": clean, "updatedAt": updated_at}


initialize()
