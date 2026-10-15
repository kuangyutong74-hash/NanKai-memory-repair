import { chromium } from "file:///C:/Users/19817/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, ".impeccable", "map-companion");
await fs.mkdir(output, { recursive:true });
const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".png":"image/png", ".webp":"image/webp", ".jpg":"image/jpeg" };
const browser = await chromium.launch({ headless:true, executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe" });
const errors = [];

for (const [name, viewport] of [["desktop",{width:1440,height:900}],["tablet",{width:690,height:1046}],["mobile",{width:390,height:844}]]) {
  const page = await browser.newPage({ viewport });
  await page.addInitScript(() => {
    localStorage.setItem("nankai-memory-tutorial-v1:guest:map", "done");
    localStorage.setItem("nankai-memory-tutorial-v1:guest:quiz", "done");
  });
  page.on("pageerror", error => errors.push(`${name}: ${error.message}`));
  await page.route("http://nankai.local/**", async route => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/health") return route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ ok:true, geniosConfigured:true }) });
    if (url.pathname === "/api/agent/reset") return route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ ok:true }) });
    if (url.pathname === "/api/agent/event") return route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ speaker:"荷宝", text:"好耶！我们的校史修复之旅第一站就来到了老校钟这里。主楼后广场上的这口钟，藏着一段等待查阅的历史。", citations:[{label:"南开校史档案"}], meta:{ intent:"stage-intro" } }) });
    const file = path.resolve(root, decodeURIComponent(url.pathname === "/" ? "index.html" : url.pathname.slice(1)));
    try { return route.fulfill({ status:200, contentType:mime[path.extname(file)] || "application/octet-stream", body:await fs.readFile(file) }); }
    catch { return route.fulfill({ status:404, body:"Not found" }); }
  });
  await page.goto("http://nankai.local/", { waitUntil:"networkidle" });
  await page.getByRole("button", { name:"接受修复任务" }).click();
  await page.getByRole("button", { name:"进入本章地图" }).click();
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => {
    const avatar = document.querySelector("#studentAvatar").getBoundingClientRect();
    const mascot = document.querySelector("#mapAgentHandle").getBoundingClientRect();
    const nodes = [...document.querySelectorAll(".stage-node")].map(node => node.getBoundingClientRect());
    const speech = getComputedStyle(document.querySelector("#mapAgentSpeech"));
    const overlap = !(avatar.right < mascot.left || avatar.left > mascot.right || avatar.bottom < mascot.top || avatar.top > mascot.bottom);
    const center = rect => ({ x:rect.left + rect.width / 2, y:rect.top + rect.height / 2 });
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const avatarCenter = center(avatar);
    return { avatarWidth:avatar.width, mascotWidth:mascot.width, overlap, firstDistance:distance(avatarCenter, center(nodes[0])), secondDistance:distance(avatarCenter, center(nodes[1])), hebaoDistance:distance(center(mascot),center(nodes[0])), chatInHeader:document.querySelector("#mapChatSlot")?.contains(document.querySelector("#hebaoChatTrigger")), lineClamp:speech.webkitLineClamp, text:document.querySelector("#mapAgentSpeech").textContent };
  });
  if (name !== "tablet" && before.overlap) errors.push(`${name}: repairer overlaps Hebao`);
  if (before.firstDistance >= before.secondDistance) errors.push(`${name}: repairer appears closer to stage 2 before stage 1 is played`);
  if (!before.chatInHeader) errors.push(`${name}: chat entry is not mounted in the map header`);
  const maxHebaoDistance = name === "desktop" ? 430 : name === "tablet" ? 300 : 210;
  if (before.hebaoDistance > maxHebaoDistance) errors.push(`${name}: Hebao is too far from stage 1 (${before.hebaoDistance}px)`);
  if (before.avatarWidth < (name === "desktop" ? 80 : 64)) errors.push(`${name}: repairer is too small (${before.avatarWidth}px)`);
  if (before.lineClamp === "2") errors.push(`${name}: normal map dialogue is still clamped`);
  await page.locator("#hebaoChatTrigger").click();
  await page.waitForTimeout(250);
  const whileChat = await page.evaluate(() => {
    const agent = document.querySelector("#mapAgent");
    const style = getComputedStyle(agent);
    return { hidden:agent.hidden, visibility:style.visibility, display:style.display, panelOpen:!document.querySelector("#hebaoChatPanel").hidden };
  });
  if (whileChat.hidden || whileChat.visibility === "hidden" || whileChat.display === "none") errors.push(`${name}: map Hebao disappears when chat opens`);
  if (!whileChat.panelOpen) errors.push(`${name}: chat panel did not open`);
  await page.locator("#hebaoChatClose").click();
  await page.locator(".stage-node.active").first().click();
  await page.waitForTimeout(380);
  const stagePanel = await page.evaluate(() => ({
    visible:document.querySelector("#stagePanel").classList.contains("open"),
    hasBrief:Boolean(document.querySelector("#stageBrief")),
    hasAgentNote:Boolean(document.querySelector("#stagePanel .agent-note")),
    routeCloseOverlap:(() => {
      const route = document.querySelector("#stageRoute").getBoundingClientRect();
      const close = document.querySelector("#closeStagePanel").getBoundingClientRect();
      return !(route.right <= close.left || route.left >= close.right || route.bottom <= close.top || route.top >= close.bottom);
    })(),
    height:document.querySelector("#stagePanel").getBoundingClientRect().height,
    viewport:innerHeight
  }));
  if (!stagePanel.visible) errors.push(`${name}: stage panel did not open`);
  if (stagePanel.hasBrief || stagePanel.hasAgentNote) errors.push(`${name}: stage panel still repeats Hebao copy`);
  if (stagePanel.routeCloseOverlap) errors.push(`${name}: stage route overlaps close button`);
  if (stagePanel.height > stagePanel.viewport * .9) errors.push(`${name}: stage panel is too tall`);
  await page.screenshot({ path:path.join(output, `${name}-stage-panel.png`), fullPage:false });
  await page.locator("#startStage").click();
  const choiceStart = await page.evaluate(() => {
    const area = document.querySelector(".choice-arena").getBoundingClientRect();
    const player = document.querySelector(".arena-player").getBoundingClientRect();
    const cards = [...document.querySelectorAll(".archive-lectern")].map(card => {
      const rect = card.getBoundingClientRect(), style = getComputedStyle(card);
      return { width:rect.width, height:rect.height, opacity:Number(style.opacity), text:card.textContent.trim() };
    });
    return { cardCount:cards.length, cards, playerOffset:player.left - area.left, areaWidth:area.width };
  });
  if (choiceStart.cardCount !== 4) errors.push(`${name}: choice arena does not show four cards`);
  if (choiceStart.cards.some(card => card.width < 80 || card.height < 96 || card.opacity < .75)) errors.push(`${name}: one or more choice cards are not clearly visible`);
  if (choiceStart.playerOffset > choiceStart.areaWidth * .12) errors.push(`${name}: repairer does not start at the beginning of the choice arena`);
  await page.locator(".archive-lectern").first().click();
  await page.locator("#submitAnswer").click();
  await page.waitForTimeout(700);
  const quizResult = await page.evaluate(() => {
    const feedback = document.querySelector("#feedback").getBoundingClientRect();
    const card = document.querySelector(".question-card").getBoundingClientRect();
    return { hidden:document.querySelector("#feedback").hidden, top:feedback.top, bottom:feedback.bottom, viewport:innerHeight, cardWidth:card.width, viewportWidth:innerWidth };
  });
  if (quizResult.hidden) errors.push(`${name}: quiz feedback is hidden after verification`);
  if (quizResult.top < 0 || quizResult.bottom > quizResult.viewport) errors.push(`${name}: quiz feedback is not fully visible after verification`);
  if (quizResult.cardWidth > Math.min(1160, quizResult.viewportWidth)) errors.push(`${name}: quiz card is too wide (${quizResult.cardWidth}px)`);
  await page.screenshot({ path:path.join(output, `${name}-quiz-result.png`), fullPage:false });
  await page.evaluate(() => { state.correct = 0; state.question = stages[state.selected].questions.length - 1; state.answered = true; nextQuestion(); });
  await page.waitForTimeout(350);
  const retryState = await page.evaluate(() => ({
    mapVisible:!document.querySelector("#mapScreen").hidden,
    panelOpen:document.querySelector("#stagePanel").classList.contains("open"),
    button:document.querySelector("#startStage").textContent.trim(),
    status:document.querySelector("#stageStatus").textContent.trim()
  }));
  if (!retryState.mapVisible || !retryState.panelOpen || retryState.button !== "重新寻迹") errors.push(`${name}: failed run does not return to a visible retry action`);
  await page.locator("#startStage").click();
  await page.evaluate(() => { state.correct = stages[state.selected].questions.length; finishStage(); });
  await page.waitForTimeout(350);
  const storyState = await page.evaluate(() => {
    const title = document.querySelector("#storyTitle"), restored = document.querySelector("#restoredCaption"), caption = document.querySelector("#storyImageCaption");
    return {
      visible:!document.querySelector("#storyScreen").hidden,
      hasSourceNode:Boolean(document.querySelector("#storySource")),
      restoredText:restored.textContent,
      imageCaption:caption.textContent,
      titleSize:parseFloat(getComputedStyle(title).fontSize),
      titleWidth:title.getBoundingClientRect().width,
      viewportWidth:innerWidth
    };
  });
  if (!storyState.visible) errors.push(`${name}: completion story is not visible`);
  if (storyState.hasSourceNode || storyState.restoredText.includes("《") || storyState.imageCaption.includes("《")) errors.push(`${name}: completion story still exposes image source copy`);
  if (storyState.titleSize > 58 || (name === "desktop" && storyState.titleWidth > storyState.viewportWidth * .8)) errors.push(`${name}: completion title remains oversized`);
  await page.screenshot({ path:path.join(output, `${name}-story.png`), fullPage:false });
  await page.locator("#continueJourney").click();
  await page.waitForTimeout(2100);
  const awaitingFollow = await page.evaluate(() => {
    const center = element => { const rect = element.getBoundingClientRect(); return { x:rect.left + rect.width / 2, y:rect.top + rect.height / 2 }; };
    const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
    const student = center(document.querySelector("#studentAvatar")), hebao = center(document.querySelector("#mapAgent"));
    const nodes = [...document.querySelectorAll(".stage-node")].map(center);
    return {
      buttonVisible:!document.querySelector("#followHebao").hidden,
      buttonText:document.querySelector("#followHebao").textContent.trim(),
      studentFirst:distance(student,nodes[0]), studentNext:distance(student,nodes[1]),
      hebaoFirst:distance(hebao,nodes[0]), hebaoNext:distance(hebao,nodes[1])
    };
  });
  if (!awaitingFollow.buttonVisible || !awaitingFollow.buttonText.includes("思源堂")) errors.push(`${name}: follow action is not offered for the next landmark`);
  if (awaitingFollow.studentFirst >= awaitingFollow.studentNext) errors.push(`${name}: repairer moved before follow action`);
  if (awaitingFollow.hebaoNext >= awaitingFollow.hebaoFirst) errors.push(`${name}: Hebao did not move to the next landmark first`);
  await page.locator("#followHebao").click();
  await page.waitForTimeout(2100);
  const afterFollow = await page.evaluate(() => {
    const center = element => { const rect = element.getBoundingClientRect(); return { x:rect.left + rect.width / 2, y:rect.top + rect.height / 2 }; };
    const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
    const student = center(document.querySelector("#studentAvatar")), nodes = [...document.querySelectorAll(".stage-node")].map(center);
    return { studentFirst:distance(student,nodes[0]), studentNext:distance(student,nodes[1]), panelOpen:document.querySelector("#stagePanel").classList.contains("open") };
  });
  if (afterFollow.studentNext >= afterFollow.studentFirst || !afterFollow.panelOpen) errors.push(`${name}: repairer did not reach and open the next landmark after follow action`);
  await page.reload({ waitUntil:"networkidle" });
  await page.getByRole("button", { name:"接受修复任务" }).click();
  await page.getByRole("button", { name:"进入本章地图" }).click();
  await page.waitForTimeout(450);
  const afterResume = await page.evaluate(() => {
    const center = element => { const rect = element.getBoundingClientRect(); return { x:rect.left + rect.width / 2, y:rect.top + rect.height / 2 }; };
    const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
    const hebao = center(document.querySelector("#mapAgent"));
    const nodes = [...document.querySelectorAll(".stage-node")].map(center);
    return {
      hebaoFirst:distance(hebao,nodes[0]),
      hebaoNext:distance(hebao,nodes[1]),
      selected:state.selected,
      completed:[...state.completed]
    };
  });
  if (afterResume.selected !== 1 || !afterResume.completed.includes("bell")) errors.push(`${name}: saved first-stage progress was not restored`);
  if (afterResume.hebaoNext >= afterResume.hebaoFirst) errors.push(`${name}: Hebao fell back to the first landmark after reload`);
  await page.screenshot({ path:path.join(output, `${name}.png`), fullPage:true });
  console.log(JSON.stringify({ name, before, whileChat, choiceStart, quizResult, retryState, storyState, awaitingFollow, afterFollow, afterResume }));
  await page.close();
}
await browser.close();
console.log(JSON.stringify({ errors }, null, 2));
if (errors.length) process.exitCode = 1;
