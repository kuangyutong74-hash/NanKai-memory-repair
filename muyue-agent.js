(function (root) {
  "use strict";

  const HAN_RUN = /[\u4e00-\u9fff]+/g;
  const WORD = /[A-Za-z0-9_-]{2,}/g;

  function tokenize(text) {
    const value = String(text || "").toLowerCase();
    const tokens = value.match(WORD) || [];
    for (const run of value.match(HAN_RUN) || []) {
      tokens.push(...run);
      for (let index = 0; index < run.length - 1; index++) tokens.push(run.slice(index, index + 2));
    }
    return tokens;
  }

  function countTerms(tokens) {
    const counts = new Map();
    tokens.forEach(token => counts.set(token, (counts.get(token) || 0) + 1));
    return counts;
  }

  class HebaoAgent {
    constructor(options = {}) {
      this.name = "荷宝";
      this.knowledge = options.knowledge || [];
      this.endpoint = options.endpoint || "";
      this.history = [];
      this.index = this.buildIndex(this.knowledge);
    }

    buildIndex(chunks) {
      const documents = chunks.map(chunk => {
        const heading = `${chunk.documentTitle} ${chunk.sectionTitle}`;
        const tokens = tokenize(chunk.content).concat(tokenize(heading), tokenize(heading));
        return { chunk, counts: countTerms(tokens), length: Math.max(1, tokens.length) };
      });
      const documentFrequency = new Map();
      documents.forEach(document => document.counts.forEach((_, term) => documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1)));
      const averageLength = documents.length ? documents.reduce((sum, document) => sum + document.length, 0) / documents.length : 1;
      return { documents, documentFrequency, averageLength };
    }

    retrieve(query, context = {}) {
      const queryTerms = countTerms(tokenize(query));
      const total = Math.max(1, this.index.documents.length);
      const scored = this.index.documents.map(document => {
        let score = 0;
        const matched = [];
        queryTerms.forEach((queryFrequency, term) => {
          const frequency = document.counts.get(term) || 0;
          if (!frequency) return;
          matched.push(term);
          const documentFrequency = this.index.documentFrequency.get(term) || 0;
          const inverseFrequency = Math.log(1 + (total - documentFrequency + .5) / (documentFrequency + .5));
          const denominator = frequency + 1.5 * (.25 + .75 * document.length / this.index.averageLength);
          score += inverseFrequency * frequency * 2.5 / denominator * Math.min(queryFrequency, 3);
        });
        if (context.stageId && document.chunk.stageIds.includes(context.stageId)) score += 1.2;
        return { ...document.chunk, score, matchedTerms: matched.sort((a, b) => b.length - a.length).slice(0, 6) };
      }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);
      return scored.slice(0, context.topK || 2);
    }

    citation(chunk) {
      if (!chunk) return "";
      return `依据：《${chunk.documentTitle}》· ${chunk.sectionTitle}`;
    }

    reply(text, chunks = [], meta = {}) {
      const response = { speaker: this.name, text, citations: chunks.map(chunk => ({ id: chunk.id, label: this.citation(chunk) })), meta };
      this.history.push({ at: Date.now(), ...response });
      return response;
    }

    guideMap({ stage, stageIndex, completed, total, travelling = false }) {
      if (completed >= total) return this.reply("六处影像全部归档。你找回的不只是一册照片，也是南开人在时代中的选择。", [], { intent: "journey-complete" });
      if (travelling) return this.reply(`第${stageIndex}站已经归档。跟上路线，我们正在前往${stage.title}。`, [], { intent: "travel" });
      return this.reply(`当前任务：${stage.title}。点击建筑，核验与它相关的三份档案。`, [], { intent: "map-guide" });
    }

    introduceQuestion({ stage, question, questionIndex, wrongStreak }) {
      const chunks = this.retrieve(`${stage.title} ${question.text}`, { stageId: stage.id, topK: 1 });
      const introductions = [
        "这是档案选择题。点击一座档案台选择答案，再点击“确认核验”；题干里的时间、人物和地点是重要线索。",
        "这是判断题。读完陈述后，认为符合校史记录就选“正确”，认为不符合就选“错误”，然后确认答案。",
        "这是时间排序题。把下方四份档案拖到上方1—4号位置，按年份从早到晚排列；手机上也可以先点档案箱，再点目标位置。"
      ];
      const text = `${introductions[questionIndex] || introductions[0]}${wrongStreak >= 2 ? " 你连续遇到了两处冲突记录，这一题我会提供额外辅助。" : ""}`;
      return this.reply(text, chunks, { intent: wrongStreak >= 2 ? "adaptive-assist" : "question-intro", eliminateDistractor: wrongStreak >= 2 });
    }

    nudge({ stage, question }) {
      const chunks = this.retrieve(`${stage.title} ${question.text}`, { stageId: stage.id, topK: 1 });
      return this.reply("我注意到你停留了一会儿。先锁定题干中的时间、人物或地点；如果仍然犹豫，可以调阅一条低提示度档案线索。", chunks, { intent: "hesitation-nudge" });
    }

    giveClue({ stage, question }) {
      const chunks = this.retrieve(`${stage.title} ${question.text} ${question.clue}`, { stageId: stage.id, topK: 1 });
      return this.reply(`档案线索：${question.clue}`, chunks, { intent: "archive-clue" });
    }

    reviewAnswer({ stage, question, right, clueUsed, wrongStreak }) {
      const selectedText = question.options.join(" ");
      const chunks = this.retrieve(`${stage.title} ${question.text} ${selectedText} ${question.explanation}`, { stageId: stage.id, topK: 1 });
      if (right && clueUsed) return this.reply("你利用线索完成了交叉印证，这正是档案研究的基本方法。", chunks, { intent: "answer-review", right });
      if (right) return this.reply("没有调用线索也完成了核验。下一题会提高一点信息密度。", chunks, { intent: "answer-review", right });
      const text = wrongStreak >= 2 ? "两次误判集中在相近信息上。下一题我会排除一项干扰记录，帮你重新建立时间线。" : "别把一次误判当成失败。解释已经指出冲突的档案信息，带着它继续核验。";
      return this.reply(text, chunks, { intent: "answer-review", right });
    }

    summarizeStage({ stage, correct }) {
      const chunks = this.retrieve(`${stage.title} ${stage.storyTitle} ${stage.story}`, { stageId: stage.id, topK: 2 });
      const text = correct === 3 ? "你完整辨认了本关的时间、人物与事件，影像已高质量归档。" : "你已掌握本关主线。我把容易混淆的信息附在影像说明中，归档完成。";
      return this.reply(text, chunks, { intent: "stage-summary", correct });
    }

    async ask(question, context = {}) {
      const chunks = this.retrieve(question, { stageId: context.stageId, topK: 3 });
      if (this.endpoint) {
        try {
          const response = await fetch(this.endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ agent: this.name, question, context, chunks }) });
          if (response.ok) return await response.json();
        } catch (_) { /* GeniOS 不可用时自动降级到本地检索。 */ }
      }
      if (!chunks.length) return this.reply("目前的档案片段不足以回答这个问题。我不会补写没有来源的校史信息。", [], { intent: "insufficient-evidence" });
      return this.reply(`我检索到与问题最接近的档案：${chunks[0].content}`, chunks.slice(0, 2), { intent: "local-rag-answer" });
    }
  }

  root.HebaoAgent = HebaoAgent;
  if (typeof module !== "undefined" && module.exports) module.exports = { HebaoAgent, tokenize };
})(typeof window !== "undefined" ? window : this);
