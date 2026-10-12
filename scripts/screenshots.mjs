import fs from "node:fs";
import path from "node:path";
import { chromium, webkit, devices } from "playwright";

const base = (process.env.SCREENSHOT_BASE || "http://127.0.0.1:4173/takeod-site").replace(/\/$/, "");
const outDir = process.env.SCREENSHOT_DIR || "/opt/cursor/artifacts/screenshots";
fs.mkdirSync(outDir, { recursive: true });

const routes = [
  ["home", "/"],
  ["shop", "/shop"],
  ["product", "/shop/sample-mug"],
  ["about", "/about"],
  ["faq", "/faq"],
  ["shipping", "/shipping"],
  ["privacy", "/privacy"],
  ["terms", "/terms"],
  ["contact", "/contact"],
  ["checkout", "/checkout"],
];

const errors = [];

async function prepare(page, route) {
  const failed = [];
  page.on("pageerror", (error) => failed.push(error.message));
  await page.goto(`${base}${route}`, { waitUntil: "load", timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForSelector("h1, .hero__title", { timeout: 15000 });
  await page.waitForTimeout(1200);
  const text = (await page.locator("main").innerText()).trim();
  if (text.length < 8) failed.push(`empty main for ${route}`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 2) failed.push(`horizontal overflow ${overflow}px on ${route}`);
  return failed;
}

async function shoot(browserType, label, contextOptions) {
  const browser = await browserType.launch();
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  for (const [name, route] of routes) {
    const failed = await prepare(page, route);
    if (failed.length) errors.push(`${label} ${name}: ${failed.join("; ")}`);
    await page.screenshot({
      path: path.join(outDir, `${name}-${label}.png`),
      fullPage: true,
    });
  }
  await browser.close();
}

const iphone = devices["iPhone 13"];

await shoot(chromium, "1280", {
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
});

await shoot(webkit, "390", {
  ...iphone,
  viewport: { width: 390, height: 844 },
});

const check = await chromium.launch();
const context = await check.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();
await page.goto(`${base}/shop`, { waitUntil: "load" });
await page.getByRole("button", { name: "Hats" }).click();
await page.waitForTimeout(700);
const hats = await page.locator(".product-card").evaluateAll((cards) =>
  cards.filter((card) => card.style.display !== "none").map((card) => card.textContent),
);
if (!hats.some((text) => text.includes("Sample Hat"))) errors.push("filter did not show the sample hat");
await page.goto(`${base}/shop/sample-mug`, { waitUntil: "load" });
await page.getByRole("button", { name: "Start an Order" }).click();
await page.waitForSelector("h1");
const checkout = await page.locator("h1").innerText();
if (!checkout.includes("PLACEHOLDER — Checkout")) errors.push(`checkout heading was ${checkout}`);
const muted = await page.goto(`${base}/`, { waitUntil: "load" }).then(async () =>
  page.locator(".hero__video").first().evaluate((video) => ({
    muted: video.muted,
    playsInline: video.playsInline || video.hasAttribute("playsinline"),
  })),
);
if (!muted.muted || !muted.playsInline) errors.push(`hero video attrs ${JSON.stringify(muted)}`);
await check.close();

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Wrote screenshots to ${outDir}`);
