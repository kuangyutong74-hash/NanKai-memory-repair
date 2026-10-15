import { chromium } from "file:///C:/Users/19817/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, ".impeccable", "tutorial");
await fs.mkdir(output, { recursive:true });
const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".png":"image/png", ".webp":"image/webp", ".jpg":"image/jpeg" };
const browser = await chromium.launch({ headless:true, executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe" });
const errors = [];

for (const [name, viewport] of [["desktop",{width:1440,height:900}],["mobile",{width:390,height:844}]]) {
  const page = await browser.newPage({ viewport });
  page.on("pageerror", error => errors.push(`${name}: ${error.message}`));
  await page.route("http://nankai.local/**", async route => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith("/api/")) return route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ ok:true, geniosConfigured:true }) });
    const file = path.resolve(root, decodeURIComponent(url.pathname === "/" ? "index.html" : url.pathname.slice(1)));
    try { return route.fulfill({ status:200, contentType:mime[path.extname(file)] || "application/octet-stream", body:await fs.readFile(file) }); }
    catch { return route.fulfill({ status:404, body:"Not found" }); }
  });
  await page.goto("http://nankai.local/", { waitUntil:"networkidle" });
  await page.evaluate(() => window.nankaiTutorial.start(true));
  await page.waitForTimeout(350);
  const intro = await page.evaluate(() => ({
    visible:!document.querySelector("#tutorialOverlay").hidden,
    title:document.querySelector("#tutorialTitle").textContent,
    shadeCount:document.querySelectorAll(".tutorial-shade").length,
    card:document.querySelector("#tutorialCard").getBoundingClientRect().toJSON(),
    viewport:{ width:innerWidth, height:innerHeight }
  }));
  if (!intro.visible || intro.shadeCount !== 4 || !intro.title.includes("南开记忆")) errors.push(`${name}: cover tutorial did not open correctly`);
  if (intro.card.left < 0 || intro.card.right > intro.viewport.width || intro.card.top < 0 || intro.card.bottom > intro.viewport.height) errors.push(`${name}: cover tutorial card overflows viewport`);
  await page.screenshot({ path:path.join(output, `${name}-cover.png`) });
  await page.locator("#tutorialSkip").click();
  await page.locator("#enterGame").click();
  await page.locator("#enterChapter").click();
  await page.waitForTimeout(520);
  if (await page.locator("#tutorialOverlay").getAttribute("hidden") !== null) errors.push(`${name}: map tutorial did not open automatically on first visit`);
  for (let i=0;i<3;i++) await page.locator("#tutorialNext").click();
  await page.waitForTimeout(350);
  const map = await page.evaluate(() => {
    const ring = document.querySelector("#tutorialFocus").getBoundingClientRect();
    const chat = document.querySelector("#hebaoChatTrigger").getBoundingClientRect();
    const overlaps = !(ring.right < chat.left || ring.left > chat.right || ring.bottom < chat.top || ring.top > chat.bottom);
    return { title:document.querySelector("#tutorialTitle").textContent, overlaps, triggerVisible:Boolean(document.querySelector(".tutorial-trigger")) };
  });
  if (!map.title.includes("问荷宝") || !map.overlaps || !map.triggerVisible) errors.push(`${name}: map tutorial does not highlight Hebao chat`);
  await page.screenshot({ path:path.join(output, `${name}-map-hebao.png`) });
  await page.locator("#tutorialNext").click();
  await page.locator("#followHebao").click();
  await page.waitForTimeout(2100);
  await page.locator("#startStage").click();
  await page.waitForTimeout(520);
  const quiz = await page.evaluate(() => {
    const ring = document.querySelector("#tutorialFocus").getBoundingClientRect();
    const question = document.querySelector(".question-card").getBoundingClientRect();
    const overlaps = !(ring.right < question.left || ring.left > question.right || ring.bottom < question.top || ring.top > question.bottom);
    return {
      visible:!document.querySelector("#tutorialOverlay").hidden,
      title:document.querySelector("#tutorialTitle").textContent,
      overlaps,
      hasLegacyClue:Boolean(document.querySelector("#clueButton"))
    };
  });
  if (!quiz.visible || !quiz.title.includes("核验") || !quiz.overlaps || quiz.hasLegacyClue) errors.push(`${name}: quiz first-visit tutorial or Hebao-only hint entry is incorrect`);
  await page.screenshot({ path:path.join(output, `${name}-quiz-first-visit.png`) });
  await page.close();
}

await browser.close();
console.log(JSON.stringify({ errors }, null, 2));
if (errors.length) process.exitCode = 1;
