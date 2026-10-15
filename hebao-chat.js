(function (root) {
  "use strict";

  const QUICK_QUESTIONS = {
    map: ["介绍这个地标", "下一步该去哪里", "照片碎片怎么收集", "这个章节讲了什么"],
    quiz: ["给我第一层线索", "这道题在考什么", "解释档案中的词语", "我该从哪里开始看"],
    review: ["为什么选择这个答案", "这道题背后的校史", "继续介绍这座建筑"],
    chapter: ["介绍这个历史阶段", "本章需要修复什么", "第一站在哪里"],
    story: ["这张照片记录了什么", "继续介绍这座建筑", "下一步该去哪里"]
  };
  const messageId = () => globalThis.crypto?.randomUUID?.() || `hebao-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  class HebaoChat {
    constructor({ client, contextProvider, onOpenChange = () => {} }) {
      this.client = client;
      this.contextProvider = contextProvider;
      this.onOpenChange = onOpenChange;
      this.opened = false;
      this.available = true;
      this.pending = false;
      this.unread = false;
      this.hintLevels = new Map();
      this.introducedQuestions = new Set();
      this.messages = [];
      try { this.messages = JSON.parse(sessionStorage.getItem("nankai-hebao-chat") || "[]"); } catch (_) { this.messages = []; }
      if (!Array.isArray(this.messages)) this.messages = [];
      this.bind();
      this.render();
      this.refreshAvailability();
    }

    bind() {
      this.trigger = document.getElementById("hebaoChatTrigger");
      this.panel = document.getElementById("hebaoChatPanel");
      this.log = document.getElementById("hebaoChatLog");
      this.form = document.getElementById("hebaoChatForm");
      this.input = document.getElementById("hebaoChatInput");
      this.trigger.addEventListener("click", () => this.toggle());
      document.getElementById("hebaoChatClose").addEventListener("click", () => this.close());
      document.getElementById("hebaoChatCollapse").addEventListener("click", () => this.close());
      this.form.addEventListener("submit", event => {
        event.preventDefault();
        const value = this.input.value.trim();
        if (!value) return;
        this.input.value = "";
        this.ask(value);
      });
      document.addEventListener("keydown", event => {
        if (event.altKey && event.key.toLowerCase() === "h") { event.preventDefault(); this.toggle(); }
        if (event.key === "Escape" && this.opened) this.close();
      });
    }

    save() {
      sessionStorage.setItem("nankai-hebao-chat", JSON.stringify(this.messages.slice(-80)));
    }

    async refreshAvailability() {
      this.setAvailability(await this.client.available());
    }

    setAvailability(available) {
      this.available = available;
      this.trigger.classList.toggle("offline", !available);
      this.trigger.setAttribute("aria-description", available ? "打开荷宝随行对话" : "荷宝网络暂不可用，本地游戏仍可继续");
      this.input.disabled = !available;
      document.getElementById("hebaoChatSend").disabled = !available || this.pending;
      document.getElementById("hebaoChatStatus").textContent = available ? "GeniOS 档案会话已连接" : "暂时无法连接荷宝，游戏仍可继续";
    }

    setVisible(visible) {
      this.trigger.hidden = !visible;
      if (!visible) this.close();
    }

    open() {
      if (this.trigger.hidden) return;
      this.opened = true;
      this.unread = false;
      this.panel.hidden = false;
      this.trigger.setAttribute("aria-expanded", "true");
      this.trigger.classList.remove("has-unread");
      this.syncContext();
      this.render();
      this.onOpenChange(true);
      requestAnimationFrame(() => this.input.focus());
      this.ensureQuestionIntro();
    }

    close() {
      if (!this.opened) return;
      this.opened = false;
      this.panel.hidden = true;
      this.trigger.setAttribute("aria-expanded", "false");
      this.onOpenChange(false);
      this.trigger.focus();
    }

    toggle() { this.opened ? this.close() : this.open(); }

    syncContext() {
      const context = this.contextProvider();
      document.getElementById("hebaoChatContext").textContent = context.contextLabel;
      const mode = context.page === "quiz" ? (context.reviewMode || context.questionSubmitted ? "review" : "quiz") : context.page;
      this.renderQuickQuestions(QUICK_QUESTIONS[mode] || QUICK_QUESTIONS.map);
      this.trigger.classList.toggle("has-hint", mode === "quiz");
      document.getElementById("hebaoChatTriggerLabel").textContent = mode === "quiz" ? "问荷宝·有线索" : "问荷宝";
    }

    sceneChanged(label) {
      const last = this.messages[this.messages.length - 1];
      if (!label || (last?.role === "system" && last.text === label)) return;
      this.messages.push({ id: messageId(), role: "system", text: label });
      this.save();
      this.syncContext();
      this.render();
    }

    renderQuickQuestions(items) {
      const container = document.getElementById("hebaoChatQuick");
      container.innerHTML = "";
      items.forEach(text => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = text;
        button.disabled = !this.available || this.pending;
        button.addEventListener("click", () => this.ask(text));
        container.appendChild(button);
      });
    }

    questionKey(context) {
      return `${context.chapterId || ""}:${context.stageId || ""}:${context.questionIndex ?? ""}`;
    }

    isHintRequest(text) {
      return /线索|考什么|从哪里|怎么分析|排除|观察/.test(text);
    }

    async ensureQuestionIntro() {
      const context = this.contextProvider();
      if (context.page !== "quiz" || context.questionSubmitted || context.reviewMode) return;
      const key = this.questionKey(context);
      if (this.introducedQuestions.has(key)) return;
      this.introducedQuestions.add(key);
      await this.ask("我第一次打开了当前档案的随行助手，请先说明你会如何陪我分析。", { hiddenUser: true, forcedHintLevel: 0 });
    }

    async ask(text, options = {}) {
      if (this.pending || !this.available) return;
      const context = this.contextProvider();
      const key = this.questionKey(context);
      let hintLevel = this.hintLevels.get(key) || 0;
      if (!context.questionSubmitted && !context.reviewMode && context.page === "quiz" && this.isHintRequest(text)) {
        hintLevel = Math.min(3, Math.max(1, hintLevel + 1));
        this.hintLevels.set(key, hintLevel);
      }
      if (Number.isInteger(options.forcedHintLevel)) hintLevel = options.forcedHintLevel;
      if (!options.hiddenUser) this.messages.push({ id: messageId(), role: "user", text });
      const loadingId = messageId();
      this.messages.push({ id: loadingId, role: "loading", text: "荷宝正在翻阅档案……" });
      this.pending = true;
      this.render();
      this.setAvailability(true);
      try {
        const reply = await this.client.chat({ ...context, playerQuestion: text, hintLevel });
        this.messages = this.messages.filter(message => message.id !== loadingId);
        this.receiveAgent(reply);
      } catch (error) {
        this.messages = this.messages.filter(message => message.id !== loadingId);
        this.messages.push({ id: messageId(), role: "error", text: error.message === "荷宝正在重新整理线索，请稍后再试" ? error.message : "暂时无法连接荷宝，请重新查阅", retry: { text, options } });
        this.setAvailability(false);
      } finally {
        this.pending = false;
        document.getElementById("hebaoChatSend").disabled = !this.available;
        this.save();
        this.render();
      }
    }

    receiveAgent(reply) {
      this.messages.push({ id: messageId(), role: "assistant", text: reply.text, citations: reply.citations || [] });
      if (!this.opened) {
        this.unread = true;
        this.trigger.classList.add("has-unread", "message-arrived");
        setTimeout(() => this.trigger.classList.remove("message-arrived"), 520);
      }
      this.save();
      this.render();
    }

    render() {
      if (!this.log) return;
      this.log.innerHTML = "";
      // 场景切换消息仅用于会话上下文，不进入玩家可见的消息流。
      const visibleMessages = this.messages.filter(message => message.role !== "system");
      if (!visibleMessages.length) {
        const empty = document.createElement("p");
        empty.className = "hebao-chat-empty";
        empty.textContent = "打开一份档案，荷宝会结合当前场景陪你查阅。";
        this.log.appendChild(empty);
      }
      visibleMessages.forEach(message => {
        const article = document.createElement("article");
        article.className = `hebao-message ${message.role}`;
        if (message.role === "assistant") {
          const avatar = document.createElement("img");
          avatar.src = "assets/hebao-guide.png";
          avatar.alt = "";
          article.appendChild(avatar);
        }
        const body = document.createElement("div");
        body.className = "hebao-message-body";
        const paragraph = document.createElement("p");
        paragraph.textContent = message.text;
        body.appendChild(paragraph);
        if (message.citations?.length) {
          const sources = document.createElement("div");
          sources.className = "hebao-sources";
          message.citations.forEach(source => {
            const span = document.createElement("span");
            span.textContent = source.label;
            sources.appendChild(span);
          });
          body.appendChild(sources);
        }
        if (message.retry) {
          const retry = document.createElement("button");
          retry.type = "button";
          retry.textContent = "重新查阅";
          retry.addEventListener("click", async () => { await this.refreshAvailability(); if (this.available) this.ask(message.retry.text, message.retry.options); });
          body.appendChild(retry);
        }
        article.appendChild(body);
        this.log.appendChild(article);
      });
      this.log.scrollTop = this.log.scrollHeight;
      this.syncContext();
    }

    async clear() {
      this.messages = [];
      this.hintLevels.clear();
      this.introducedQuestions.clear();
      sessionStorage.removeItem("nankai-hebao-chat");
      await this.client.resetConversation();
      this.render();
    }
  }

  root.HebaoChat = HebaoChat;
})(typeof window !== "undefined" ? window : this);
