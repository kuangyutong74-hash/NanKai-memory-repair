(function (root) {
  "use strict";

  class HebaoClient {
    constructor(options = {}) {
      this.endpoint = options.endpoint || "/api/agent/event";
      this.onReply = options.onReply || (() => {});
    }

    loading(text = "正在检索校史档案……") {
      return { speaker: "荷宝", text, citations: [], meta: { intent: "loading" } };
    }

    dispatch(event, context, surface = "quiz") {
      fetch(this.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ event, context })
      }).then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      }).then(reply => this.onReply(reply, surface)).catch(() => {
        this.onReply({ speaker: "荷宝", text: "智能体服务暂时不可用，题库基础解析仍可正常使用。", citations: [], meta: { intent: "fallback" } }, surface);
      });
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
