(function (root) {
  "use strict";

  class HebaoClient {
    constructor(options = {}) {
      this.endpoint = options.endpoint || "/api/agent/event";
      this.onReply = options.onReply || (() => {});
      this.onError = options.onError || (() => {});
      this.userId = this.getOrCreateUserId();
      this.requestQueue = Promise.resolve();
      this.surfaceRequestVersion = new Map();
      this.mapGuidePrefetches = new Map();
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

    request(event, context = {}) {
      const run = this.requestQueue.catch(() => undefined).then(() => fetch(this.endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ event, context: { ...context, userId: this.userId } })
        })).then(async response => {
          if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.detail || `HTTP ${response.status}`);
          }
          return response.json();
        });
      this.requestQueue = run.then(() => undefined, () => undefined);
      return run;
    }

    dispatch(event, context, surface = "quiz") {
      const requestVersion = (this.surfaceRequestVersion.get(surface) || 0) + 1;
      this.surfaceRequestVersion.set(surface, requestVersion);
      this.request(event, context).then(reply => {
        if (this.surfaceRequestVersion.get(surface) !== requestVersion) return;
        this.onReply(reply, surface);
      }).catch(error => {
        if (this.surfaceRequestVersion.get(surface) !== requestVersion) return;
        console.warn(`荷宝智能体请求失败 [${event}]：${error.message}`);
        this.onError(error, { event, context, surface });
      });
      return this.loading();
    }

    mapGuideKey(context = {}) {
      return String(context.stage?.id ?? context.stageIndex ?? "");
    }

    prefetchMapGuide(context) {
      const key = this.mapGuideKey(context);
      if (!key || this.mapGuidePrefetches.has(key)) return;
      // 仍通过同一个 GeniOS 会话请求；这里只把等待时间藏在修复结果页中。
      const pending = this.request("map-guide", context)
        .then(reply => ({ reply }))
        .catch(error => ({ error }));
      this.mapGuidePrefetches.set(key, pending);
    }

    guideMap(context) {
      const key = this.mapGuideKey(context);
      const prefetched = key ? this.mapGuidePrefetches.get(key) : null;
      if (!prefetched) return this.dispatch("map-guide", context, "map");
      this.mapGuidePrefetches.delete(key);
      const requestVersion = (this.surfaceRequestVersion.get("map") || 0) + 1;
      this.surfaceRequestVersion.set("map", requestVersion);
      prefetched.then(({ reply, error }) => {
        if (this.surfaceRequestVersion.get("map") !== requestVersion) return;
        if (error) {
          console.warn(`荷宝智能体请求失败 [map-guide]：${error.message}`);
          this.onError(error, { event: "map-guide", context, surface: "map" });
          return;
        }
        this.onReply(reply, "map");
      });
      return this.loading();
    }

    chat(context) { return this.request("chat-message", context); }

    async resetConversation() {
      await fetch("/api/agent/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId: this.userId })
      }).catch(() => undefined);
    }

    async available() {
      try {
        const response = await fetch("/api/health", { cache: "no-store" });
        const value = await response.json();
        return response.ok && value.geniosConfigured === true;
      } catch (_) { return false; }
    }

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
