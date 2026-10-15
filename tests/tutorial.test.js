const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const game = fs.readFileSync(path.join(root, "game.js"), "utf8");
const tutorial = fs.readFileSync(path.join(root, "tutorial.js"), "utf8");

assert.match(html, /id="tutorialOverlay"[\s\S]*id="tutorialSkip"[\s\S]*id="tutorialPrevious"[\s\S]*id="tutorialNext"/, "tutorial overlay must expose skip and step controls");
assert.equal((html.match(/class="tutorial-trigger"/g) || []).length, 2, "map and quiz top bars must both expose the tutorial entry");
assert.match(tutorial, /nankai-memory-tutorial-v1:/, "completion must be stored per account");
assert.match(tutorial, /stepsFor\(surface\)[\s\S]*surface === "map"[\s\S]*surface === "quiz"/, "tutorial content must adapt to the current game surface");
assert.match(tutorial, /#hebaoChatTrigger[\s\S]*问荷宝/, "tutorial must explain the Hebao chat entry");
assert.match(game, /nankaiTutorial\?\.autoFor\(window\.nankaiAccount\.user\.username\)/, "successful account restore or login must trigger first-run onboarding");
assert.match(game, /autoForSurface\("map"\)[\s\S]*autoForSurface\("quiz"\)/, "map and quiz must each trigger their own first-visit tutorial");
assert.doesNotMatch(html, /id="clueButton"|查阅档案线索/, "quiz hints must be accessed only through Hebao chat");
assert.doesNotMatch(game, /\$\("clueButton"\)|function useClue/, "removed clue controls must not leave dead handlers");
assert.doesNotMatch(tutorial, /#clueButton/, "quiz onboarding must not point at the removed clue button");

console.log("first-run and replayable tutorial wiring is present");
