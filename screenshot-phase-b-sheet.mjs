import { chromium } from "/root/projects/website/node_modules/playwright/index.mjs";

const TOKEN = process.env.TOK;
if (!TOKEN) throw new Error("TOK env required");

const browser = await chromium.launch();

const sizes = [
  { name: "360", w: 360, h: 800 },
  { name: "390", w: 390, h: 844 },
  { name: "414", w: 414, h: 896 },
  { name: "768", w: 768, h: 1024 },
  { name: "1280", w: 1280, h: 800 },
];

for (const s of sizes) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3002/login", { waitUntil: "networkidle" });
  await page.evaluate((t) => localStorage.setItem("apple_jwt", t), TOKEN);

  // Snapshot the today page closed
  await page.goto("http://localhost:3002/today", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({
    path: `/root/projects/apple-website/shot-phase-b-today-${s.name}.png`,
    fullPage: false,
  });

  // Open the first + Bayad button on the collection list
  const buttonCount = await page.locator("button:has-text('Bayad')").count();
  if (buttonCount > 0) {
    await page.locator("button:has-text('Bayad')").first().click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: `/root/projects/apple-website/shot-phase-b-bayadsheet-${s.name}.png`,
      fullPage: false,
    });
  } else {
    console.log(`[${s.name}] no Bayad button found`);
  }

  await ctx.close();
}

await browser.close();
console.log("ok");
