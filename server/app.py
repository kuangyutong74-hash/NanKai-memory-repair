"""FastAPI 入口：游戏数据、荷宝智能体与前端静态资源。"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .game_data import chapter_payload
from .genios import GeniosError, genios
from .auth import AuthError, load_save, login, register, revoke, save_progress, user_for_token

ROOT = Path(__file__).absolute().parents[1]


class AgentRequest(BaseModel):
    event: str = Field(min_length=1, max_length=40)
    context: dict[str, Any] = Field(default_factory=dict)


class Credentials(BaseModel):
    username: str = Field(min_length=3, max_length=20)
    password: str = Field(min_length=8, max_length=72)


class Registration(Credentials):
    display_name: str = Field(alias="displayName", min_length=1, max_length=20)


class SaveRequest(BaseModel):
    completed: list[str] = Field(default_factory=list, max_length=50)


app = FastAPI(title="南开记忆修复计划", version="0.2.0")


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {"ok": True, "agent": "荷宝", "chapters": 3, "geniosConfigured": genios.configured}


@app.get("/api/game/chapters")
def chapters() -> dict[str, Any]:
    return {"chapters": chapter_payload()}


def _bearer(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="请先登录修复员账号")
    return authorization[7:].strip()


def _current_user(authorization: str | None) -> tuple[str, dict[str, Any]]:
    token = _bearer(authorization)
    user = user_for_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="登录状态已失效，请重新登录")
    return token, user


@app.post("/api/auth/register")
def auth_register(request: Registration) -> dict[str, Any]:
    try:
        return register(request.username, request.password, request.display_name)
    except AuthError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.post("/api/auth/login")
def auth_login(request: Credentials) -> dict[str, Any]:
    try:
        return login(request.username, request.password)
    except AuthError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@app.get("/api/auth/me")
def auth_me(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    _, user = _current_user(authorization)
    return {"user": user}


@app.post("/api/auth/logout")
def auth_logout(authorization: str | None = Header(default=None)) -> dict[str, bool]:
    token, _ = _current_user(authorization)
    revoke(token)
    return {"ok": True}


@app.get("/api/game/save")
def game_save(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    _, user = _current_user(authorization)
    return load_save(int(user["id"]))


@app.put("/api/game/save")
def update_game_save(request: SaveRequest, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    _, user = _current_user(authorization)
    return save_progress(int(user["id"]), request.completed)


@app.post("/api/agent/event")
async def agent_event(request: AgentRequest) -> dict[str, Any]:
    if not genios.configured:
        raise HTTPException(status_code=503, detail="GeniOS API 尚未配置")
    try:
        reply = await genios.send_event(request.event, request.context)
    except (GeniosError, httpx.HTTPError, ValueError) as exc:
        raise HTTPException(status_code=502, detail=f"GeniOS 调用失败：{str(exc)[:160]}") from exc
    reply.setdefault("speaker", "荷宝")
    reply.setdefault("meta", {})
    reply["meta"]["provider"] = "genios"
    return reply


app.mount("/assets", StaticFiles(directory=ROOT / "assets"), name="assets")
app.mount("/tests", StaticFiles(directory=ROOT / "tests"), name="tests")


@app.get("/")
def index() -> FileResponse:
    return FileResponse(ROOT / "index.html")


@app.get("/{filename:path}")
def static_file(filename: str) -> FileResponse:
    target = (ROOT / filename).absolute()
    if ROOT not in target.parents or not target.is_file():
        return FileResponse(ROOT / "index.html")
    return FileResponse(target)
