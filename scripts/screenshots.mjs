import fs from "node:fs";
import path from "node:path";
import { chromium, webkit, devices } from "playwright";

const base = (process.env.SCREENSHOT_BASE || "http://127.0.0.1:4173").replace(/\/$/, "");
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
  ["thank-you", "/thank-you"],
];

const errors = [];

async function prepare(page, route, name, label) {
  const failed = [];
  page.on("pageerror", (error) => failed.push(error.message));
  await page.goto(`${base}${route}`, { waitUntil: "load", timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForSelector("h1, .hero__title", { timeout: 15000 });
  await page.waitForTimeout(1200);
  const banner = (await page.locator(".demo-banner").innerText()).trim();
  if (banner !== "Demo mode") failed.push(`demo banner was "${banner}" on ${route}`);
  const text = (await page.locator("main").innerText()).trim();
  if (text.length < 8) failed.push(`empty main for ${route}`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 2) failed.push(`horizontal overflow ${overflow}px on ${route}`);
  if (name === "shop" && label === "390") {
    const productTop = await page.locator(".product-card").first().evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return Math.round(rect.top + window.scrollY);
    });
    if (productTop > 1100) failed.push(`products start ${productTop}px down`);
  }
  return failed;
}

async function shoot(browserType, label, contextOptions) {
  const browser = await browserType.launch();
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  for (const [name, route] of routes) {
    const failed = await prepare(page, route, name, label);
    if (failed.length) errors.push(`${label} ${name}: ${failed.join("; ")}`);
    await page.screenshot({
      path: path.join(outDir, `${name}-${label}.png`),
      fullPage: true,
    });
  }
  await page.goto(`${base}/shop/sample-shirt`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(400);
  const sizeButton = page.getByRole("button", { name: "2T" });
  const selectOptions = page.getByRole("button", { name: "Select options" });
  if (!(await sizeButton.count()) || !(await selectOptions.isDisabled())) {
    errors.push(`${label} shirt option picker did not require a size`);
  } else {
    await sizeButton.click();
    await page.getByRole("button", { name: "Add to Order & Apply Bulk Tier" }).click();
    await page.waitForSelector(".cart-drawer", { timeout: 5000 });
    const shirtDrawer = await page.locator(".cart-drawer").innerText();
    if (!shirtDrawer.includes("Toddler Tee") || !shirtDrawer.includes("Size: 2T")) {
      errors.push(`${label} shirt cart line missing size`);
    }
    await page.screenshot({ path: path.join(outDir, `shirt-options-${label}.png`) });
  }
  await page.goto(`${base}/shop/sample-mug`, { waitUntil: "load", timeout: 60000 });
  await page.getByRole("button", { name: "Add to Order & Apply Bulk Tier" }).click();
  await page.waitForSelector(".cart-drawer", { timeout: 5000 });
  const drawerText = await page.locator(".cart-drawer").innerText();
  if (!drawerText.includes("Bistro Mug") || !drawerText.includes("Subtotal")) {
    errors.push(`${label} cart drawer missing item or subtotal`);
  }
  await page.screenshot({ path: path.join(outDir, `cart-drawer-${label}.png`) });
  await page.goto(`${base}/cart`, { waitUntil: "load", timeout: 60000 });
  await page.waitForSelector(".cart-line", { timeout: 5000 });
  const cartFailed = [];
  const cartBanner = (await page.locator(".demo-banner").innerText()).trim();
  if (cartBanner !== "Demo mode") cartFailed.push(`demo banner was "${cartBanner}"`);
  const cartText = await page.locator("main").innerText();
  if (!cartText.includes("Bistro Mug") || !cartText.includes("$") || !cartText.includes("Subtotal")) {
    cartFailed.push("cart page missing item, subtotal amount, or subtotal");
  }
  const cartOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (cartOverflow > 2) cartFailed.push(`horizontal overflow ${cartOverflow}px`);
  if (cartFailed.length) errors.push(`${label} cart: ${cartFailed.join("; ")}`);
  await page.screenshot({ path: path.join(outDir, `cart-${label}.png`), fullPage: true });
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
await page.getByRole("button", { name: "Hats & Beanies" }).click();
await page.waitForTimeout(700);
const hats = await page.locator(".product-card").evaluateAll((cards) =>
  cards.filter((card) => card.style.display !== "none").map((card) => card.textContent),
);
if (!hats.some((text) => text.includes("UV50+"))) errors.push("filter did not show the sample hat");
await page.goto(`${base}/shop/sample-mug`, { waitUntil: "load" });
await page.getByRole("button", { name: "Add to Order & Apply Bulk Tier" }).click();
await page.waitForSelector(".cart-drawer");
await page.goto(`${base}/cart`, { waitUntil: "load" });
await page.getByRole("button", { name: "Proceed to Checkout" }).click();
await page.waitForFunction(() => document.querySelector("h1")?.textContent?.includes("PLACEHOLDER — Checkout"), null, {
  timeout: 8000,
});
const checkout = await page.locator("h1").innerText();
if (!checkout.includes("PLACEHOLDER — Checkout")) errors.push(`checkout heading was ${checkout}`);
const muted = await page.goto(`${base}/`, { waitUntil: "load" }).then(async () =>
  page.locator(".hero__video").first().evaluate((video) => ({
    muted: video.muted,
    playsInline: video.playsInline || video.hasAttribute("playsinline"),
  })),
);
if (!muted.muted || !muted.playsInline) errors.push(`hero video attrs ${JSON.stringify(muted)}`);
const homeText = await page.locator("main").innerText();
if (homeText.includes("View All 32 Products") || !/View All \d+ Products/.test(homeText)) {
  errors.push(`home catalog count missing in "${homeText.slice(0, 400)}"`);
}
const cursor = await page.evaluate(() => ({
  html: document.documentElement.className,
  cursor: getComputedStyle(document.body).cursor,
  ring: document.querySelector(".cursor-ring, .cursor-dot"),
}));
if (cursor.html.includes("has-cursor") || cursor.cursor === "none" || cursor.ring) {
  errors.push(`custom cursor still active ${JSON.stringify(cursor)}`);
}
await check.close();

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Wrote screenshots to ${outDir}`);
