import { chromium } from "file:///C:/Users/19817/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, ".impeccable", "chat");
await fs.mkdir(output, { recursive:true });
const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".png":"image/png", ".webp":"image/webp", ".jpg":"image/jpeg" };
const browser = await chromium.launch({ headless:true, executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe" });
const errors = [];

for (const [name, viewport] of [["desktop",{width:1440,height:900}],["mobile",{width:390,height:844}]]) {
  const page = await browser.newPage({ viewport });
  await page.addInitScript(() => { localStorage.setItem("nankai-memory-tutorial-v1:guest:map", "done"); localStorage.setItem("nankai-memory-tutorial-v1:guest:quiz", "done"); });
  page.on("pageerror", error => errors.push(`${name}: ${error.message}`));
  await page.addInitScript(() => sessionStorage.setItem("nankai-hebao-chat", JSON.stringify([
    { id:"system-check", role:"system", text:"已进入老校钟 · 第1份档案" },
    { id:"assistant-check", role:"assistant", text:"我已经看到你正在核验的这份档案了。我不会直接告诉你答案，但可以陪你分析。", citations:[] },
    { id:"user-check", role:"user", text:"我该从哪里开始看？" }
  ])));
  await page.route("http://nankai.local/**", async route => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/health") return route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ ok:true, geniosConfigured:true }) });
    if (url.pathname === "/api/agent/reset") return route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ ok:true }) });
    if (url.pathname === "/api/agent/event") return route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ speaker:"荷宝", text:"先留意档案中反复出现的用途描述，我们从这些词开始核验。", citations:[{label:"南开校史档案"}], meta:{} }) });
    const file = path.resolve(root, decodeURIComponent(url.pathname === "/" ? "index.html" : url.pathname.slice(1)));
    try { return route.fulfill({ status:200, contentType:mime[path.extname(file)] || "application/octet-stream", body:await fs.readFile(file) }); }
    catch { return route.fulfill({ status:404, body:"Not found" }); }
  });
  await page.goto("http://nankai.local/", { waitUntil:"networkidle" });
  await page.getByRole("button", { name:"接受修复任务" }).click();
  await page.getByRole("button", { name:"进入本章地图" }).click();
  await page.locator(".stage-node.active").first().click();
  await page.locator("#startStage").click();
  await page.waitForFunction(() => document.querySelector("#hebaoChatTrigger")?.parentElement?.id === "quizChatSlot");
  const closed = await page.evaluate(() => {
    const trigger = document.querySelector("#hebaoChatTrigger"), image = trigger.querySelector("img"), rect = trigger.getBoundingClientRect();
    return { hidden:trigger.hidden, position:getComputedStyle(trigger).position, width:rect.width, height:rect.height, imageWidth:image.getBoundingClientRect().width, parent:trigger.parentElement?.id, headerContains:document.querySelector(".quiz-topbar")?.contains(trigger) };
  });
  if (closed.hidden) errors.push(`${name}: chat entry is hidden on quiz`);
  if (!closed.headerContains || closed.parent !== "quizChatSlot") errors.push(`${name}: chat entry is not mounted in the quiz header`);
  if (closed.imageWidth > 60) errors.push(`${name}: chat portrait is oversized (${closed.imageWidth}px)`);
  await page.screenshot({ path:path.join(output, `${name}-quiz-entry.png`), fullPage:true });
  await page.locator("#hebaoChatTrigger").click();
  await page.waitForTimeout(360);
  const result = await page.evaluate(() => {
    const panel = document.querySelector("#hebaoChatPanel").getBoundingClientRect();
    const trigger = document.querySelector("#hebaoChatTrigger").getBoundingClientRect();
    const assistant = getComputedStyle(document.querySelector(".hebao-message.assistant .hebao-message-body p"));
    const player = getComputedStyle(document.querySelector(".hebao-message.user .hebao-message-body"));
    return { width:document.body.scrollWidth, viewport:innerWidth, panel:{ left:panel.left, right:panel.right, top:panel.top, bottom:panel.bottom, width:panel.width, height:panel.height }, trigger:{ left:trigger.left, right:trigger.right }, visible:!document.querySelector("#hebaoChatPanel").hidden, systemMessages:document.querySelectorAll(".hebao-message.system").length, assistantFont:assistant.fontSize, assistantBackground:assistant.backgroundColor, playerBackground:player.backgroundColor };
  });
  if (!result.visible) errors.push(`${name}: chat panel did not open`);
  if (result.width > result.viewport) errors.push(`${name}: horizontal overflow ${result.width}/${result.viewport}`);
  if (result.panel.left < 0 || result.panel.right > result.viewport + 1) errors.push(`${name}: chat panel outside viewport`);
  if (name === "desktop" && (result.panel.width < 360 || result.panel.width > 400)) errors.push(`${name}: panel width ${result.panel.width}`);
  if (result.panel.height > viewport.height * .76) errors.push(`${name}: panel too tall ${result.panel.height}/${viewport.height}`);
  if (result.systemMessages !== 0) errors.push(`${name}: system messages are visible`);
  if (result.assistantFont !== "14px") errors.push(`${name}: assistant text is not 14px (${result.assistantFont})`);
  if (result.assistantBackground === result.playerBackground) errors.push(`${name}: assistant and player bubbles are not visually distinct`);
  await page.screenshot({ path:path.join(output, `${name}.png`), fullPage:false });
  console.log(JSON.stringify({ name, result }));
  await page.close();
}
await browser.close();
console.log(JSON.stringify({ errors }, null, 2));
if (errors.length) process.exitCode = 1;
