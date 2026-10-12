const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = fs.readFileSync(path.resolve(__dirname, "..", "content-data.js"), "utf8");
const sandbox = {};
vm.runInNewContext(`${source}\nthis.result = contentData;`, sandbox);

const questions = sandbox.result.stageCatalog.flatMap(stage => stage.questions);
const question = questions.find(item => item.code === "B07-2");

assert.ok(question, "B07-2 should exist");
assert.match(question.text, /这位校友是？$/);
assert.deepEqual(Array.from(question.options), ["周恩来", "陈省身", "郭永怀", "温家宝"]);
assert.equal(question.answer, 0);
assert.equal(question.answerText, "A. 周恩来");
assert.match(question.explanation, /1959年5月28日/);
assert.match(question.explanation, /职工食堂/);

console.log("B07-2 matches the revised 48-question document");
