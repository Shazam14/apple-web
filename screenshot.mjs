import { chromium } from "/root/projects/website/node_modules/playwright/index.mjs";

const TOKEN = process.env.TOK;
if (!TOKEN) throw new Error("TOK env required");

const browser = await chromium.launch();

const sizes = [
  { name: "mobile", w: 375, h: 1600 },
  { name: "tablet", w: 768, h: 1400 },
  { name: "desktop", w: 1280, h: 1400 },
];

for (const s of sizes) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3002/login", { waitUntil: "networkidle" });
  await page.evaluate((t) => localStorage.setItem("apple_jwt", t), TOKEN);
  await page.goto("http://localhost:3002/", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `/root/projects/apple-website/shot-${s.name}.png`, fullPage: true });
  await ctx.close();
}

await browser.close();
console.log("ok");
