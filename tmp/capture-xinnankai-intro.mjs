import { chromium } from "file:///C:/Users/19817/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const output = "D:/Desktop/校史档案闯关/新南开_章节序幕_1920x1080.png";
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.addInitScript(() => {
  localStorage.setItem("nankai-memory-progress", JSON.stringify(["bell", "siyuan", "xiushan", "mati", "muzhai"]));
  localStorage.setItem("nankai-memory-music", "off");
  localStorage.setItem("nankai-memory-tutorial-v1:guest", "done");
});
await page.goto("http://127.0.0.1:8090/", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "接受修复任务" }).click();
await page.locator("#chapterIntro").waitFor({ state: "visible" });
await page.waitForTimeout(1800);
await page.screenshot({ path: output });
console.log(output);
await browser.close();
