const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(path.resolve(__dirname, "..", "hebao-client.js"), "utf8");
assert.doesNotMatch(source, /offline-guidance|fallback/i, "GeniOS failures must never be replaced by a local dynamic answer");
assert.match(source, /onError/, "GeniOS failures must be surfaced to the UI");
assert.match(source, /chat-message/, "free-form companion chat must use the existing GeniOS client");

const storage = new Map();
global.window = {
  localStorage: {
    getItem: key => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
  },
};

let activeRequests = 0;
let maxConcurrentRequests = 0;
const replies = [];

global.fetch = async (_url, options) => {
  activeRequests += 1;
  maxConcurrentRequests = Math.max(maxConcurrentRequests, activeRequests);
  await new Promise(resolve => setTimeout(resolve, 25));
  activeRequests -= 1;
  const request = JSON.parse(options.body);
  return {
    ok: true,
    json: async () => ({ speaker: "荷宝", text: request.context.label || request.event, citations: [], meta: {} }),
  };
};

require("../hebao-client.js");

const client = new window.HebaoClient({ onReply: (reply, surface) => replies.push({ text:reply.text, surface }) });
client.dispatch("game_intro", { label:"开场" }, "intro");
client.dispatch("map-guide", { label:"第二站介绍" }, "map");
client.dispatch("map-guide", { label:"第三站介绍" }, "map");
client.dispatch("question-intro", { label:"题目介绍" }, "quiz");

setTimeout(() => {
  assert.deepEqual(replies, [
    { text:"开场", surface:"intro" },
    { text:"第三站介绍", surface:"map" },
    { text:"题目介绍", surface:"quiz" },
  ], "an older reply on the same surface must not overwrite the newest landmark context");
  assert.equal(maxConcurrentRequests, 1, "one browser user must not overlap agent requests");
  console.log("hebao-client serializes requests and suppresses stale same-surface replies");
}, 150);
