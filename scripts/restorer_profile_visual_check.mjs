import { chromium } from "file:///C:/Users/19817/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, ".impeccable", "restorer-profile");
await fs.mkdir(output, { recursive:true });
const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".png":"image/png", ".webp":"image/webp", ".jpg":"image/jpeg" };
const browser = await chromium.launch({ headless:true, executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe" });
const errors = [];

for (const [name, viewport] of [["desktop",{width:1440,height:900}],["mobile",{width:390,height:844}]]) {
  const page = await browser.newPage({ viewport });
  let registration = null;
  await page.addInitScript(() => {
    localStorage.setItem("nankai-memory-tutorial-v1:xiaokai", "done");
    localStorage.setItem("nankai-memory-tutorial-v1:xiaokai:map", "done");
  });
  page.on("pageerror", error => errors.push(`${name}: ${error.message}`));
  await page.route("http://nankai.local/**", async route => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/auth/register") {
      registration = JSON.parse(route.request().postData() || "{}");
      return route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ token:"test-token", user:{ id:1, username:"xiaokai", displayName:"小开", gender:"female" } }) });
    }
    if (url.pathname === "/api/game/save") return route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ completed:[], updatedAt:null }) });
    if (url.pathname === "/api/health") return route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ ok:true, geniosConfigured:true }) });
    if (url.pathname === "/api/agent/event") return route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ speaker:"荷宝", text:"欢迎来到老校钟。", citations:[], meta:{} }) });
    const file = path.resolve(root, decodeURIComponent(url.pathname === "/" ? "index.html" : url.pathname.slice(1)));
    try { return route.fulfill({ status:200, contentType:mime[path.extname(file)] || "application/octet-stream", body:await fs.readFile(file) }); }
    catch { return route.fulfill({ status:404, body:"Not found" }); }
  });
  await page.goto("http://nankai.local/", { waitUntil:"networkidle" });
  await page.locator("#registerTab").click();
  await page.locator("#displayName").fill("小开");
  await page.locator("#accountUsername").fill("xiaokai");
  await page.locator("#accountPassword").fill("archive-1919");
  await page.locator('input[name="gender"][value="female"]').check();
  await page.screenshot({ path:path.join(output, `${name}-registration.png`) });
  await page.locator("#accountSubmit").click();
  await page.locator("#enterGame").click();
  await page.locator("#enterChapter").click();
  await page.waitForTimeout(300);
  const result = await page.evaluate(() => ({
    name:document.querySelector("#studentLocation").textContent,
    image:new URL(document.querySelector("#studentAvatar img").src).pathname,
    genderFieldVisible:!document.querySelector("#genderField").hidden
  }));
  if (registration?.gender !== "female") errors.push(`${name}: registration did not submit female gender`);
  if (result.name !== "小开") errors.push(`${name}: map label is not display-name only (${result.name})`);
  if (!result.image.endsWith("/assets/student-restorer-female.png")) errors.push(`${name}: female sprite was not selected (${result.image})`);
  await page.screenshot({ path:path.join(output, `${name}-female-map.png`) });
  await page.close();
}

await browser.close();
console.log(JSON.stringify({ errors }, null, 2));
if (errors.length) process.exitCode = 1;
