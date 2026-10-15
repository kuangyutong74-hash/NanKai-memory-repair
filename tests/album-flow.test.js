const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const game = fs.readFileSync(path.join(root, "game.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

for (const id of ["albumDock", "albumButton", "albumOverlay", "albumMemorial", "albumPhotoPage", "albumEnding", "albumMute", "albumSchoolSong"]) {
  assert.match(html, new RegExp(`id="${id}"`), `${id} should be connected to the main game document`);
}
assert.match(html, /<header class="game-header">[\s\S]*id="albumDock"[\s\S]*class="header-progress"/, "album entry should live in the map header before total progress");
assert.match(html, /assets\/nankai-album-cover\.webp/, "album entry should use the generated archival cover asset");
assert.doesNotMatch(html, /id="albumHint"[\s\S]{0,180}<img/, "album notice must not render a second Hebao portrait");
assert.match(game, /meta:\{ intent:"album-locked" \}[\s\S]*}, "map"/, "locked album feedback should reuse the map agent");
assert.match(game, /nankai-memory-album/);
assert.match(game, /function albumUnlocked\(\) \{ return state\.completed\.length === stages\.length; \}/, "album must unlock from the current run's 14\/14 progress, not a stale persisted flag");
assert.match(game, /function resetCurrentGame\(\)[\s\S]*?lockAlbumForCurrentRun\(\);[\s\S]*?renderAlbumDock\(\);/, "restarting must lock the album together with cleared stage progress");
assert.match(game, /function reconcileAlbumWithCurrentRun\(\)[\s\S]*?state\.completed\.length === stages\.length[\s\S]*?if \(albumState\.unlocked\) lockAlbumForCurrentRun\(\)/, "album state must be reconciled against current progress");
assert.match(game, /async function syncAccountProgress\(\)[\s\S]*?renderMap\(\);\s*reconcileAlbumWithCurrentRun\(\);/, "async account progress must refresh the album lock state after loading");
assert.match(game, /nankai-memory-stats/);
assert.match(game, /state\.completed\.length === stages\.length/);
assert.match(game, /function typeText\(/);
assert.match(game, /function playAlbumMusic\(\)/);
assert.match(game, /function stopAlbumMusic\(\)/);
assert.match(game, /createBufferSource\(\)/, "typewriter should use a mechanical noise strike instead of a synthetic beep");
assert.match(html, /assets\/nankai-school-song\.mp3[^>]*loop/, "album should contain the looping school song track");
assert.match(game, /character === "\\n" \? 280/);
assert.match(game, /prefers-reduced-motion: reduce/);
assert.match(game, /重新开始后，本轮答题进度、用时和相册解锁状态将被清除/);
assert.match(css, /\.album-overlay/);
assert.match(css, /@media \(max-width:760px\)/);

console.log("album flow is integrated with progress, persistence, typing, sound controls and responsive layout");
