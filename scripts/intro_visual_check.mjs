import { chromium } from "file:///C:/Users/19817/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, ".impeccable", "intro");
await fs.mkdir(output, { recursive:true });
const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".png":"image/png", ".webp":"image/webp", ".jpg":"image/jpeg" };
const browser = await chromium.launch({ headless:true, executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe" });
const errors = [];
for (const [name,viewport] of [["desktop",{width:1440,height:900}],["mobile",{width:390,height:844}]]) {
  const page = await browser.newPage({ viewport });
  page.on("pageerror", error => errors.push(`${name}: ${error.message}`));
  await page.route("http://nankai.local/**", async route => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith("/api/")) return route.fulfill({ status:200, contentType:"application/json", body:"{}" });
    const file = path.resolve(root, decodeURIComponent(url.pathname === "/" ? "index.html" : url.pathname.slice(1)));
    try { return route.fulfill({ status:200, contentType:mime[path.extname(file)] || "application/octet-stream", body:await fs.readFile(file) }); }
    catch { return route.fulfill({ status:404, body:"Not found" }); }
  });
  await page.goto("http://nankai.local/", { waitUntil:"networkidle" });
  const result = await page.evaluate(() => ({ width:document.body.scrollWidth, viewport:innerWidth, agentTop:document.querySelector(".intro-agent").getBoundingClientRect().top, fileTop:document.querySelector(".intro-file").getBoundingClientRect().top, emblemVisible:document.querySelector(".intro-emblem img").getBoundingClientRect().height > 0 }));
  if (result.width > result.viewport) errors.push(`${name}: horizontal overflow ${result.width}/${result.viewport}`);
  if (result.agentTop >= result.fileTop) errors.push(`${name}: Hebao is not above the dossier`);
  if (!result.emblemVisible) errors.push(`${name}: emblem is not visible`);
  await page.screenshot({ path:path.join(output,`${name}.png`), fullPage:true });
  console.log(JSON.stringify({ name,result }));
  await page.close();
}
await browser.close();
console.log(JSON.stringify({ errors }, null, 2));
if (errors.length) process.exitCode = 1;
