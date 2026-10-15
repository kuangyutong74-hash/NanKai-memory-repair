const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const game = fs.readFileSync(path.join(root, "game.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

assert.doesNotMatch(
  game,
  /presentAgent\(hebao\.introduceGame\(\),\s*["']intro["']\)/,
  "the cover introduction must not occupy the remote agent queue",
);
assert.match(html, /id="mapAgent" class="map-agent open"/, "Hebao should start expanded on the map");
assert.match(html, /id="mapAgentHandle"[^>]+aria-expanded="true"/, "the expanded state must be announced");
assert.match(html, /我是你的南开校史探索伙伴/, "the cover must contain its introduction without an API call");
assert.match(html, /class="music-toggle/, "map and quiz headers should expose a music control");
assert.match(game, /function startGameMusic\(mode\)/, "game music should provide scene-specific playback");
assert.match(html, /id="mapBgm"[^>]+src="assets\/map-bgm\.mp3(?:\?v=\d+)?"[^>]+loop/, "the supplied map track should loop on map screens");
assert.match(html, /id="stageBgm"[^>]+src="assets\/stage-bgm\.mp3"[^>]+loop/, "the supplied stage track should loop inside stages");
assert.match(game, /map:\s*\$\("mapBgm"\)/, "map mode should use the supplied map track");
assert.match(game, /quiet:\s*\$\("stageBgm"\)/, "stage mode should use the supplied stage track");
assert.doesNotMatch(game, /mapMelody|quietMelody|scheduleGameMusicNote|musicFrequency/, "the old synthesized placeholder music should be removed");
assert.match(game, /function toggleGameMusic\(\)/, "music should be user-toggleable");
assert.match(game, /nankai-memory-music/, "music preference should persist");
assert.match(css, /chapter-intro-frame-v1\.png/, "chapter intro should use the generated frame");
assert.match(css, /hebao-chat-frame-v1\.png/, "Hebao chat should use the generated frame");
assert.match(css, /hebao-chat-frame-v2\.png/, "Hebao chat should use the non-pixel illustrated frame");
assert.match(html, /id="mapCaptionToggle"[^>]+aria-expanded="true"/, "map chapter information should be collapsible");
assert.match(game, /function toggleMapCaption\(\)/, "map chapter information should expose a persisted toggle");
assert.match(game, /nankai-memory-map-caption/, "map chapter information preference should persist");
assert.match(game, /className = "feedback feedback-review"/, "completed-stage review should use its own archive record treatment");
assert.match(game, /feedback-review-label/, "review feedback should expose a clear archive record label");
assert.doesNotMatch(css, /\.feedback::before\s*\{/, "neutral review feedback must not reserve an empty status stamp");
assert.match(css, /\.feedback-correct::before,\.feedback-wrong::before/, "correct and wrong feedback should keep their meaningful status stamps");

console.log("game startup keeps the cover local and map agent expanded");
