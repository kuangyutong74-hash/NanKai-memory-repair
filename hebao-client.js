(function (root) {
  "use strict";

  class HebaoClient {
    constructor(options = {}) {
      this.endpoint = options.endpoint || "/api/agent/event";
      this.onReply = options.onReply || (() => {});
      this.userId = this.getOrCreateUserId();
      this.requestQueue = Promise.resolve();
    }

    getOrCreateUserId() {
      const key = "nankai-memory-user-id";
      try {
        const existing = window.localStorage.getItem(key);
        if (existing) return existing;
        const random = globalThis.crypto?.randomUUID?.().replaceAll("-", "").slice(0, 16)
          || `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`.slice(0, 16);
        window.localStorage.setItem(key, random);
        return random;
      } catch (_) {
        return "anonymous-browser";
      }
    }

    loading(text = "正在检索校史档案……") {
      return { speaker: "荷宝", text, citations: [], meta: { intent: "loading" } };
    }

    dispatch(event, context, surface = "quiz") {
      const run = this.requestQueue.then(() => fetch(this.endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ event, context: { ...context, userId: this.userId } })
        })).then(async response => {
          if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.detail || `HTTP ${response.status}`);
          }
          return response.json();
        }).then(reply => this.onReply(reply, surface)).catch(error => {
        console.warn(`荷宝智能体请求失败 [${event}]：${error.message}`);
        const text = event === "route-locked"
          ? "这张地图可以预览，但关卡体验仍未解锁。请先完成当前路线，荷宝会在解锁后带你正式进入。"
          : "智能体服务暂时不可用，题库基础解析仍可正常使用。";
        this.onReply({ speaker: "荷宝", text, citations: [], meta: { intent: "fallback" } }, surface);
      });
      this.requestQueue = run.catch(() => undefined);
      return this.loading();
    }

    guideMap(context) { return this.dispatch("map-guide", context, "map"); }
    guardRoute(context) { return this.dispatch("route-locked", context, "map"); }
    introduceQuestion({ stage, question, questionIndex, wrongStreak }) { return this.dispatch("question-intro", { stage, question, questionIndex, wrongStreak }); }
    nudge({ stage, question }) { return this.dispatch("nudge", { stage, question }); }
    giveClue({ stage, question }) { return this.dispatch("clue", { stage, question }); }
    reviewAnswer(context) { return this.dispatch("answer-review", context); }
    summarizeStage(context) { return this.dispatch("stage-summary", context, "story"); }
    reply(text) { return this.dispatch("retry", { text }); }
  }

  root.HebaoClient = HebaoClient;
})(typeof window !== "undefined" ? window : this);
