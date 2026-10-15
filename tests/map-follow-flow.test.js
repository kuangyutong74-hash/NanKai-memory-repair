const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const game = fs.readFileSync(path.resolve(__dirname, "..", "game.js"), "utf8");
const journey = game.slice(game.indexOf("function journeyToNextStage()"), game.indexOf("const albumPages"));
const followHandler = game.slice(game.indexOf('$("followHebao").addEventListener'), game.indexOf('$("resetGame").addEventListener'));
const chapterEntry = game.slice(game.indexOf("function enterActiveChapter()"), game.indexOf("function isUnlocked"));
const finishStage = game.slice(game.indexOf("function finishStage()"), game.indexOf("function moveCameraTo"));

assert.doesNotMatch(journey, /setStudentPosition\(next/, "journey completion must not move the repairer automatically");
assert.match(journey, /guideMapHebao\(next,[\s\S]*pendingFollowStage = next/, "Hebao must reach the next landmark before follow is offered");
assert.match(followHandler, /targetStage = pendingFollowStage/, "follow action must use the pending landmark instead of the chapter first stage");
assert.match(followHandler, /pendingFollowStage \?\? chapterEntryStageIndex\(activeChapterIndex\)/, "follow fallback must preserve the current chapter progress");
assert.match(followHandler, /setStudentPosition\(targetStage, true\)/, "repairer must move only after follow is clicked");
assert.match(chapterEntry, /chapterEntryStageIndex\(activeChapterIndex\)/, "chapter re-entry must restore Hebao at the saved progress landmark");
assert.doesNotMatch(chapterEntry, /const firstStage = chapterStageIndices/, "chapter re-entry must not hard-code the first landmark");
assert.match(finishStage, /prefetchMapGuide\(mapGuideContext\(nextStageIndex, true\)\)/, "the next GeniOS landmark introduction must start loading on the reward screen");

console.log("map progression keeps Hebao ahead until the player follows");
