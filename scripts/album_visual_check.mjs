import { chromium } from "file:///C:/Users/19817/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, ".impeccable", "album");
await fs.mkdir(output, { recursive: true });
const completed = ["bell","siyuan","xiushan","mati","library","xinkai","haibing","wenzhong","main","zhou","lianda","yifu","today","three"];
const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".mp3":"audio/mpeg" };
const browser = await chromium.launch({ headless:true, executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe" });
const errors = [];

for (const [name, viewport] of [["desktop",{width:1440,height:900}],["mobile",{width:390,height:844}]]) {
  const page = await browser.newPage({ viewport });
  await page.addInitScript(() => { localStorage.setItem("nankai-memory-tutorial-v1:guest:map", "done"); localStorage.setItem("nankai-memory-tutorial-v1:guest:quiz", "done"); });
  page.on("pageerror", error => errors.push(`${name}: ${error.message}`));
  page.on("console", message => { if (message.type() === "error") errors.push(`${name}: ${message.text()}`); });
  await page.route("http://nankai.local/**", async route => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith("/api/")) return route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ speaker:"荷宝", text:"测试提示", citations:[], meta:{} }) });
    const relative = decodeURIComponent(url.pathname === "/" ? "index.html" : url.pathname.slice(1));
    const file = path.resolve(root, relative);
    if (!file.startsWith(root)) return route.abort();
    try { return route.fulfill({ status:200, contentType:mime[path.extname(file).toLowerCase()] || "application/octet-stream", body:await fs.readFile(file) }); }
    catch { return route.fulfill({ status:404, body:"Not found" }); }
  });
  await page.addInitScript(({completed}) => {
    localStorage.setItem("nankai-memory-progress", JSON.stringify(completed));
    localStorage.setItem("nankai-memory-stats", JSON.stringify({ startedAt:Date.now()-754000, finishedAt:Date.now(), correct:37, total:42, clues:4 }));
    localStorage.setItem("nankai-memory-album", JSON.stringify({ unlocked:true, opened:false, readPages:[], currentPage:0, completedEnding:false, muted:true, record:{ startedAt:Date.now()-754000, finishedAt:Date.now(), correct:37, total:42, clues:4, completed:14 } }));
  }, { completed });
  await page.goto("http://nankai.local/", { waitUntil:"networkidle" });
  await page.getByRole("button", { name:"接受修复任务" }).click();
  await page.getByRole("button", { name:"进入本章地图" }).click();
  await page.locator("#albumButton").click();
  await page.waitForTimeout(180);
  if (await page.locator("#albumSchoolSong").evaluate(audio => audio.paused)) errors.push(`${name}: school song did not start with the album`);
  await page.locator("#albumRevealText").click();
  if (!await page.locator("#albumStats").evaluate(el => el.classList.contains("visible"))) errors.push(`${name}: stats did not reveal after text completion`);
  const layout = await page.evaluate(() => ({ bodyWidth:document.body.scrollWidth, viewportWidth:innerWidth, overlayHidden:document.querySelector("#albumOverlay").hidden, title:document.querySelector("#albumPageTitle").textContent }));
  if (layout.bodyWidth > layout.viewportWidth) errors.push(`${name}: horizontal overflow ${layout.bodyWidth}/${layout.viewportWidth}`);
  await page.waitForTimeout(350);
  await page.screenshot({ path:path.join(output,`${name}.png`), fullPage:true });
  for (let albumPage = 1; albumPage <= 3; albumPage++) {
    await page.locator("#albumNext").click();
    await page.locator("#albumPhotoReveal").click();
    if (albumPage === 1) await page.screenshot({ path:path.join(output,`${name}-inside.png`), fullPage:true });
  }
  await page.locator("#albumNext").click();
  await page.locator("#albumEndingReveal").click();
  if (await page.locator("#albumEndingActions").getAttribute("hidden") !== null) errors.push(`${name}: ending actions did not appear`);
  const ending = await page.evaluate(() => {
    const section = document.querySelector("#albumEnding").getBoundingClientRect();
    const cover = document.querySelector(".album-ending-cover").getBoundingClientRect();
    const illustration = getComputedStyle(document.querySelector(".album-ending-illustration")).backgroundImage;
    return { section, cover, illustration, overflow:document.querySelector("#albumBook").scrollWidth > document.querySelector("#albumBook").clientWidth };
  });
  if (!ending.illustration.includes("album-ending-storybook.png")) errors.push(`${name}: ending storybook background is missing`);
  if (ending.cover.right > ending.section.right + 1 || ending.cover.bottom > ending.section.bottom + 1 || ending.overflow) errors.push(`${name}: ending layout overflows`);
  await page.screenshot({ path:path.join(output,`${name}-ending.png`), fullPage:true });
  await page.locator("#albumFinish").click();
  if (!await page.locator("#albumOverlay").evaluate(el => el.hidden)) errors.push(`${name}: album did not close`);
  if (!await page.locator("#albumSchoolSong").evaluate(audio => audio.paused && audio.currentTime === 0)) errors.push(`${name}: school song did not stop and reset when the album closed`);
  if (await page.locator("#albumHintMenu").getAttribute("hidden") !== null) errors.push(`${name}: post-album actions did not appear`);
  console.log(JSON.stringify({name,layout}));
  await page.close();
}
await browser.close();
console.log(JSON.stringify({ screenshots:["desktop.png","mobile.png","desktop-inside.png","mobile-inside.png","desktop-ending.png","mobile-ending.png"], consoleErrors:errors }, null, 2));
if (errors.length) process.exitCode = 1;
