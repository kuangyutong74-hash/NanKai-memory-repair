const assert = require("node:assert/strict");

const storage = new Map();
global.window = {
  localStorage: {
    getItem: key => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
  },
};

let requestCount = 0;
let finishRequest;
global.fetch = async (_url, options) => {
  requestCount += 1;
  await new Promise(resolve => { finishRequest = resolve; });
  const request = JSON.parse(options.body);
  return {
    ok: true,
    json: async () => ({ speaker: "荷宝", text: `欢迎来到${request.context.stage.title}`, citations: [], meta: {} }),
  };
};

require("../hebao-client.js");

(async () => {
  const replies = [];
  const client = new window.HebaoClient({ onReply: reply => replies.push(reply.text) });
  const context = { stage: { id: "mati", title: "马蹄湖" }, stageIndex: 3 };

  client.prefetchMapGuide(context);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(requestCount, 1, "the next landmark request must start before the guide is consumed");

  finishRequest();
  await new Promise(resolve => setTimeout(resolve, 0));
  client.guideMap(context);
  await new Promise(resolve => setTimeout(resolve, 0));

  assert.equal(requestCount, 1, "arrival must reuse the prefetched GeniOS reply instead of sending a duplicate request");
  assert.deepEqual(replies, ["欢迎来到马蹄湖"]);
  console.log("map guide starts early and reuses the original GeniOS reply on arrival");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
