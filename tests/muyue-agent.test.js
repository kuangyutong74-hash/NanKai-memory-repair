const assert = require("node:assert/strict");
const knowledge = require("../knowledge.js");
const { HebaoAgent, tokenize } = require("../muyue-agent.js");

async function run() {
  const agent = new HebaoAgent({ knowledge });

  assert(tokenize("校钟1919").includes("校钟"), "中文双字切分应包含校钟");

  const bell = agent.retrieve("校钟铭文 文以治国 理以强国 商以富国", { stageId: "bell" });
  assert.equal(bell[0].id, "culture-bell", "校钟问题应优先命中校园文化读本");

  const clue = agent.giveClue({
    stage: { id: "three", title: "爱国三问碑" },
    question: { text: "爱国三问由谁提出？", clue: "他也是南开大学首任校长。" }
  });
  assert(clue.citations.length > 0, "档案线索必须带来源");

  const adaptive = agent.introduceQuestion({
    stage: { id: "bell", title: "校钟" },
    question: { text: "校钟铭文是什么？" },
    questionIndex: 1,
    wrongStreak: 2
  });
  assert.equal(adaptive.meta.eliminateDistractor, true, "连续误判应触发自适应辅助");

  const unknown = await agent.ask("月球背面的南开建筑是什么？");
  assert(["insufficient-evidence", "local-rag-answer"].includes(unknown.meta.intent), "未知问题必须走检索或资料不足分支");

  console.log("HebaoAgent tests passed");
}

run().catch(error => { console.error(error); process.exitCode = 1; });
