const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const game = fs.readFileSync(path.join(root, "game.js"), "utf8");

assert.match(html, /name="gender" value="male"[\s\S]*name="gender" value="female"/, "registration must offer both player avatars");
assert.match(game, /student-restorer-female\.png/, "female accounts must select the female sprite");
assert.match(game, /studentLocation"\)\.textContent = restorerName\(\)/, "map label must show only the registered display name");
assert.match(game, /imageCaptionWithoutContributor\(page\.caption\)/, "album captions must remove contributor wording");
assert.doesNotMatch(game.slice(game.indexOf("function renderWalkChoice"), game.indexOf("function chooseWalkOption")), /src="assets\/student-restorer\.png"/, "choice scene must not hard-code the male sprite");

console.log("registered name, gender avatar and cleaned album caption are wired through the game");
