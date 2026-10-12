const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const game = fs.readFileSync(path.join(root, "game.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

assert.doesNotMatch(
  game,
  /presentAgent\(hebao\.introduceGame\(\),\s*["']intro["']\)/,
  "the cover introduction must not occupy the remote agent queue",
);
assert.match(html, /id="mapAgent" class="map-agent open"/, "Hebao should start expanded on the map");
assert.match(html, /id="mapAgentHandle"[^>]+aria-expanded="true"/, "the expanded state must be announced");
assert.match(html, /我是你的南开校史探索伙伴/, "the cover must contain its introduction without an API call");

console.log("game startup keeps the cover local and map agent expanded");
