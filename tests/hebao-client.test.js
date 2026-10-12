const assert = require("node:assert/strict");

const storage = new Map();
global.window = {
  localStorage: {
    getItem: key => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
  },
};

let activeRequests = 0;
let maxConcurrentRequests = 0;
let replyCount = 0;

global.fetch = async () => {
  activeRequests += 1;
  maxConcurrentRequests = Math.max(maxConcurrentRequests, activeRequests);
  await new Promise(resolve => setTimeout(resolve, 25));
  activeRequests -= 1;
  return {
    ok: true,
    json: async () => ({ speaker: "荷宝", text: "ok", citations: [], meta: {} }),
  };
};

require("../hebao-client.js");

const client = new window.HebaoClient({ onReply: () => { replyCount += 1; } });
client.dispatch("game_intro", {}, "intro");
client.dispatch("question-intro", {}, "quiz");

setTimeout(() => {
  assert.equal(replyCount, 2, "both queued replies should be delivered");
  assert.equal(maxConcurrentRequests, 1, "one browser user must not overlap agent requests");
  console.log("hebao-client serializes agent requests");
}, 90);
