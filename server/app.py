"""FastAPI 入口：游戏数据、荷宝智能体与前端静态资源。"""

from pathlib import Path
from typing import Any

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .agent import agent
from .game_data import chapter_payload

ROOT = Path(__file__).resolve().parents[1]


class AgentRequest(BaseModel):
    event: str = Field(min_length=1, max_length=40)
    context: dict[str, Any] = Field(default_factory=dict)


app = FastAPI(title="南开记忆修复计划", version="0.2.0")


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {"ok": True, "agent": "荷宝", "chapters": 3}


@app.get("/api/game/chapters")
def chapters() -> dict[str, Any]:
    return {"chapters": chapter_payload()}


@app.post("/api/agent/event")
def agent_event(request: AgentRequest) -> dict[str, Any]:
    return agent.respond(request.event, request.context)


app.mount("/assets", StaticFiles(directory=ROOT / "assets"), name="assets")
app.mount("/tests", StaticFiles(directory=ROOT / "tests"), name="tests")


@app.get("/")
def index() -> FileResponse:
    return FileResponse(ROOT / "index.html")


@app.get("/{filename:path}")
def static_file(filename: str) -> FileResponse:
    target = (ROOT / filename).resolve()
    if ROOT not in target.parents or not target.is_file():
        return FileResponse(ROOT / "index.html")
    return FileResponse(target)
