import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const URL = "https://hasnain7abbas.github.io/lattice/";
const OUT = resolve("docs/images");
mkdirSync(OUT, { recursive: true });

const SETeLED_MS = 4500;

async function shoot({ viewport, file, deviceScale = 1, fullPage = false, device }) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(
    device
      ? device
      : { viewport, deviceScaleFactor: deviceScale, colorScheme: "dark" }
  );
  const page = await ctx.newPage();
  console.log(`[${file}] loading ${URL} at ${viewport?.width ?? device.viewport.width}x${viewport?.height ?? device.viewport.height}…`);
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(SETeLED_MS); // let three.js mount + first frame render
  const out = resolve(OUT, file);
  await page.screenshot({ path: out, fullPage, timeout: 90_000, animations: "disabled" });
  console.log(`[${file}] saved → ${out}`);
  await browser.close();
}

await shoot({
  viewport: { width: 1600, height: 1000 },
  file: "hero.png",
  deviceScale: 1.25,
});

await shoot({
  viewport: { width: 1440, height: 900 },
  file: "desktop.png",
  deviceScale: 1,
});

await shoot({
  device: { ...devices["Pixel 7"], colorScheme: "dark" },
  file: "mobile.png",
});

console.log("done.");
