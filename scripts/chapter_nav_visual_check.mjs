import { chromium } from "file:///C:/Users/19817/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, ".impeccable", "chapter-navigation");
const pageUrl = pathToFileURL(path.join(root, "index.html")).href;
await fs.mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const errors = [];

for (const [name, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport });
  page.on("console", message => {
    if (message.type() === "error" && message.text() !== "Failed to load resource: net::ERR_FAILED" && !message.text().includes("file:///D:/api/agent/event")) errors.push(`${name}: ${message.text()}`);
  });
  page.on("pageerror", error => errors.push(`${name}: ${error.message}`));
  await page.goto(pageUrl, { waitUntil: "load" });
  await page.getByRole("button", { name: "接受修复任务" }).click();
  await page.getByRole("button", { name: "进入本章地图" }).click();
  await page.locator("#chapterSelectTrigger").click();
  await page.locator("#chapterMenu").waitFor({ state: "visible" });
  await page.waitForTimeout(220);
  await page.keyboard.press("Escape");
  if (await page.locator("#chapterMenu").isVisible()) errors.push(`${name}: Escape did not close the menu`);
  await page.locator("#chapterSelectTrigger").press("ArrowDown");
  await page.locator("#chapterMenu").waitFor({ state: "visible" });
  await page.waitForTimeout(30);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  if (await page.locator("#chapterMenu").isVisible()) errors.push(`${name}: chapter menu did not close after preview selection`);
  const mapLabel = await page.locator("#mapViewport").getAttribute("aria-label");
  if (!mapLabel?.includes("地图预览")) errors.push(`${name}: locked chapter did not open its map preview`);
  await page.locator("#chapterSelectTrigger").click();
  await page.waitForTimeout(220);
  const metrics = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
    menu: document.querySelector("#chapterMenu")?.getBoundingClientRect().toJSON(),
    title: document.querySelector(".game-header h1")?.getBoundingClientRect().toJSON(),
  }));
  if (metrics.bodyWidth > metrics.viewportWidth) errors.push(`${name}: horizontal overflow ${metrics.bodyWidth}/${metrics.viewportWidth}`);
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true });
  console.log(JSON.stringify({ name, metrics }));
  await page.close();
}

await browser.close();
console.log(JSON.stringify({ screenshots: ["desktop.png", "mobile.png"], consoleErrors: errors }, null, 2));
if (errors.length) process.exitCode = 1;
