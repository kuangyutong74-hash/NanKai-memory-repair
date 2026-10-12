const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const game = fs.readFileSync(path.join(root, "game.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

assert.match(html, /id="chapterNav" class="chapter-nav"/);
assert.doesNotMatch(html, /id="previewChapterMap"/);
assert.doesNotMatch(html, /<select[^>]+id="chapterNav"/, "navigation should be a themed custom directory, not a native select");
assert.match(game, /aria-haspopup=\"listbox\"/);
assert.match(game, /setAttribute\("role", "option"\)/);
assert.match(game, /event\.key === "Escape"/);
assert.match(game, /"ArrowDown", "ArrowUp", "Home", "End"/);
assert.match(game, /完成上一阶段后解锁/);
assert.match(game, /可以预览地图，完成上一阶段后解锁关卡/);
assert.match(css, /animation:chapterMenuIn \.18s/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);

console.log("chapter navigation is a single accessible archive dropdown with current-map preview");
