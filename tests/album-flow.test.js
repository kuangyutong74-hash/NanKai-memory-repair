const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const game = fs.readFileSync(path.join(root, "game.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

for (const id of ["albumDock", "albumButton", "albumOverlay", "albumMemorial", "albumPhotoPage", "albumEnding", "albumMute"]) {
  assert.match(html, new RegExp(`id="${id}"`), `${id} should be connected to the main game document`);
}
assert.match(html, /<header class="game-header">[\s\S]*id="albumDock"[\s\S]*class="header-progress"/, "album entry should live in the map header before total progress");
assert.match(html, /assets\/nankai-album-cover\.webp/, "album entry should use the generated archival cover asset");
assert.match(game, /nankai-memory-album/);
assert.match(game, /nankai-memory-stats/);
assert.match(game, /state\.completed\.length === stages\.length/);
assert.match(game, /function typeText\(/);
assert.match(game, /character === "\\n" \? 280/);
assert.match(game, /prefers-reduced-motion: reduce/);
assert.match(game, /重新开始后，本轮答题进度和用时将被清除/);
assert.match(css, /\.album-overlay/);
assert.match(css, /@media \(max-width:760px\)/);

console.log("album flow is integrated with progress, persistence, typing, sound controls and responsive layout");
