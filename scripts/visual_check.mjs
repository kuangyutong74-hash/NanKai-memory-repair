import { chromium } from "file:///C:/Users/19817/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, ".impeccable", "review");
await fs.mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const errors = [];

async function reachImageQuestion(page) {
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("http://127.0.0.1:8090", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "接受修复任务" }).click();
  await page.getByRole("button", { name: "进入本章地图" }).click();
  await page.getByRole("button", { name: /老校钟，可进入/ }).click();
  await page.getByRole("button", { name: "进入档案现场" }).click();
  await page.getByRole("button", { name: /B 九一八事变/ }).click();
  await page.locator("#submitAnswer").click();
  await page.locator("#submitAnswer").click();
  await page.getByRole("button", { name: /C 日本/ }).click();
  await page.locator("#submitAnswer").click();
  await page.locator("#submitAnswer").click();
  await page.locator("#questionImage").waitFor({ state: "visible" });
}

for (const [name, viewport] of [["desktop", { width: 1440, height: 1000 }], ["mobile", { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport });
  await page.addInitScript(() => { localStorage.setItem("nankai-memory-tutorial-v1:guest:map", "done"); localStorage.setItem("nankai-memory-tutorial-v1:guest:quiz", "done"); });
  await reachImageQuestion(page);
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true });
  await page.close();
}

await browser.close();
console.log(JSON.stringify({ screenshots: ["desktop.png", "mobile.png"], consoleErrors: errors }, null, 2));
if (errors.length) process.exitCode = 1;
