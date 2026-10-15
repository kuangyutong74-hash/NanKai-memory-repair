import { chromium } from "file:///C:/Users/19817/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".png":"image/png", ".webp":"image/webp", ".jpg":"image/jpeg" };
const browser = await chromium.launch({ headless:true, executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport:{ width:1440, height:900 } });
await page.addInitScript(() => { localStorage.setItem("nankai-memory-tutorial-v1:guest:map", "done"); localStorage.setItem("nankai-memory-tutorial-v1:guest:quiz", "done"); });
const errors = [];
page.on("pageerror", error => errors.push(error.message));
await page.route("http://nankai.local/**", async route => {
  const url = new URL(route.request().url());
  if (url.pathname === "/api/health") return route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ ok:true, geniosConfigured:true }) });
  if (url.pathname === "/api/agent/event") {
    const payload = route.request().postDataJSON();
    const title = payload.context?.stage?.title || "未知地标";
    await new Promise(resolve => setTimeout(resolve, 70));
    return route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ speaker:"荷宝", text:`正在介绍${title}`, citations:[], meta:{ intent:"stage-intro" } }) });
  }
  const file = path.resolve(root, decodeURIComponent(url.pathname === "/" ? "index.html" : url.pathname.slice(1)));
  try { return route.fulfill({ status:200, contentType:mime[path.extname(file)] || "application/octet-stream", body:await fs.readFile(file) }); }
  catch { return route.fulfill({ status:404, body:"Not found" }); }
});

await page.goto("http://nankai.local/", { waitUntil:"networkidle" });
await page.locator("#enterGame").click();
await page.locator("#enterChapter").click();
await page.waitForTimeout(250);
await page.evaluate(() => { updateMapAgent(1); updateMapAgent(2); });
const loadingText = await page.locator("#mapAgentSpeech").textContent();
if (!loadingText.includes("秀山堂")) errors.push(`loading state is stale: ${loadingText}`);
await page.waitForTimeout(350);
const finalText = await page.locator("#mapAgentSpeech").textContent();
if (finalText !== "正在介绍秀山堂") errors.push(`latest landmark reply was not preserved: ${finalText}`);

await browser.close();
console.log(JSON.stringify({ loadingText, finalText, errors }, null, 2));
if (errors.length) process.exitCode = 1;
