const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(path.resolve(__dirname, "..", "hebao-chat.js"), "utf8");
assert.match(source, /this\.client\.chat/, "chat messages must call the existing GeniOS client");
assert.doesNotMatch(source, /fetch\s*\(/, "chat UI must not create a parallel model/API chain");
assert.match(source, /hintLevel/, "chat must transmit progressive hint level");
assert.match(source, /questionSubmitted/, "chat must respect submission state");
assert.match(source, /重新查阅/, "failed requests must remain retryable");
assert.match(source, /sessionStorage/, "chat display history must persist across game screens");
console.log("hebao chat preserves the GeniOS-only contract");
