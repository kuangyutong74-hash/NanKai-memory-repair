import { chromium } from "file:///C:/Users/19817/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, ".impeccable", "header");
await fs.mkdir(output, { recursive: true });
const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg" };
const browser = await chromium.launch({ headless:true, executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe" });
const errors = [];

for (const [name, viewport] of [["desktop",{width:1440,height:900}],["mobile",{width:390,height:844}]]) {
  const page = await browser.newPage({ viewport });
  page.on("pageerror", error => errors.push(`${name}: ${error.message}`));
  await page.route("http://nankai.local/**", async route => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith("/api/")) return route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ speaker:"荷宝", text:"测试提示", citations:[], meta:{} }) });
    const file = path.resolve(root, decodeURIComponent(url.pathname === "/" ? "index.html" : url.pathname.slice(1)));
    if (!file.startsWith(root)) return route.abort();
    try { return route.fulfill({ status:200, contentType:mime[path.extname(file).toLowerCase()] || "application/octet-stream", body:await fs.readFile(file) }); }
    catch { return route.fulfill({ status:404, body:"Not found" }); }
  });
  await page.goto("http://nankai.local/", { waitUntil:"networkidle" });
  await page.getByRole("button", { name:"接受修复任务" }).click();
  await page.getByRole("button", { name:"进入本章地图" }).click();
  await page.locator("#chapterSelectTrigger").click();
  const result = await page.evaluate(() => {
    const header = document.querySelector(".game-header").getBoundingClientRect();
    const nav = document.querySelector("#chapterNav").getBoundingClientRect();
    const album = document.querySelector("#albumButton").getBoundingClientRect();
    const menu = document.querySelector("#chapterMenu").getBoundingClientRect();
    const overflowers = [...document.querySelectorAll("body *")].map(element => ({ element, rect:element.getBoundingClientRect() })).filter(({rect}) => rect.right > innerWidth + 1 || rect.left < -1).slice(0,8).map(({element,rect}) => ({ tag:element.tagName, id:element.id, className:element.className, left:rect.left, right:rect.right }));
    return { bodyWidth:document.body.scrollWidth, viewportWidth:innerWidth, header:{width:header.width,height:header.height}, nav:{width:nav.width}, album:{width:album.width}, menu:{left:menu.left,right:menu.right}, overflowers };
  });
  if (result.bodyWidth > result.viewportWidth) errors.push(`${name}: horizontal overflow ${result.bodyWidth}/${result.viewportWidth}`);
  if (result.menu.left < 0 || result.menu.right > result.viewportWidth) errors.push(`${name}: stage menu outside viewport`);
  await page.screenshot({ path:path.join(output, `${name}.png`), fullPage:true });
  console.log(JSON.stringify({ name, result }));
  await page.close();
}
await browser.close();
console.log(JSON.stringify({ errors }, null, 2));
if (errors.length) process.exitCode = 1;
