import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BRAND = join(ROOT, "public", "brand");
const PUBLIC = join(ROOT, "public");

function svg(name) {
  return readFileSync(join(BRAND, `${name}.svg`));
}

async function png(srcSvg, destPath, width, height) {
  mkdirSync(dirname(destPath), { recursive: true });
  await sharp(srcSvg)
    .resize(width, height ?? width)
    .png({ compressionLevel: 9 })
    .toFile(destPath);
  console.log(`  ✓ ${destPath.replace(ROOT, "").replace(/\\/g, "/")}`);
}

console.log("\n🎨 FitCoach — Brand Asset Export\n");

// ─── FAVICONS (web) ───────────────────────────────────────────────────────────
console.log("📌 Favicons");
const iconSvg = svg("icon");
await png(iconSvg, join(PUBLIC, "favicon-16.png"), 16);
await png(iconSvg, join(PUBLIC, "favicon-32.png"), 32);
await png(iconSvg, join(PUBLIC, "apple-touch-icon.png"), 180);
await png(iconSvg, join(PUBLIC, "icon-192.png"), 192);
await png(iconSvg, join(PUBLIC, "icon-512.png"), 512);

// Generate favicon.ico (32×32 PNG renamed — browsers accept PNG-based .ico)
await png(iconSvg, join(PUBLIC, "favicon.ico"), 32);

// ─── iOS APP ICONS ────────────────────────────────────────────────────────────
console.log("\n🍎 iOS icons");
const iosDir = join(BRAND, "ios");
const iosSizes = [
  [1024, "icon-1024.png"],
  [180, "icon-180.png"],   // iPhone @3x
  [167, "icon-167.png"],   // iPad Pro
  [152, "icon-152.png"],   // iPad @2x
  [120, "icon-120.png"],   // iPhone @2x
  [87,  "icon-87.png"],    // iPhone settings @3x
  [80,  "icon-80.png"],    // Spotlight @2x
  [76,  "icon-76.png"],    // iPad
  [60,  "icon-60.png"],    // iPhone
  [58,  "icon-58.png"],    // iPhone settings @2x
  [40,  "icon-40.png"],    // Spotlight
  [29,  "icon-29.png"],    // Settings
  [20,  "icon-20.png"],    // Notification
];
for (const [size, name] of iosSizes) {
  await png(iconSvg, join(iosDir, name), size);
}

// ─── ANDROID ICONS ───────────────────────────────────────────────────────────
console.log("\n🤖 Android icons");
const androidDir = join(BRAND, "android");
// Standard launcher sizes
const androidSizes = [
  [48,  "mdpi/ic_launcher.png"],
  [72,  "hdpi/ic_launcher.png"],
  [96,  "xhdpi/ic_launcher.png"],
  [144, "xxhdpi/ic_launcher.png"],
  [192, "xxxhdpi/ic_launcher.png"],
  [512, "playstore/ic_launcher.png"],
];
for (const [size, name] of androidSizes) {
  await png(iconSvg, join(androidDir, name), size);
}
// Adaptive icon (foreground + background)
const fgSvg = svg("icon-android-foreground");
const bgSvg = svg("icon-android-background");
for (const [size, density] of [[108, "mdpi"], [162, "hdpi"], [216, "xhdpi"], [324, "xxhdpi"], [432, "xxxhdpi"]]) {
  await png(fgSvg, join(androidDir, density, "ic_launcher_foreground.png"), size);
  await png(bgSvg, join(androidDir, density, "ic_launcher_background.png"), size);
}

// ─── LOGO PNGs ───────────────────────────────────────────────────────────────
console.log("\n🏷  Logo PNGs");
const logoDark = svg("logo-dark");
const logoLight = svg("logo-light");
await png(logoDark,  join(BRAND, "logo-dark@2x.png"),  440, 104);
await png(logoDark,  join(BRAND, "logo-dark@1x.png"),  220, 52);
await png(logoLight, join(BRAND, "logo-light@2x.png"), 440, 104);
await png(logoLight, join(BRAND, "logo-light@1x.png"), 220, 52);

// ─── MARKETING ────────────────────────────────────────────────────────────────
console.log("\n📣 Marketing assets");
await png(svg("og-image"),    join(BRAND, "og-image.png"),    1200, 630);
await png(svg("splash"),      join(BRAND, "splash.png"),       390, 844);
await png(svg("banner-hero"), join(BRAND, "banner-hero.png"), 1440, 500);

// ─── EMPTY STATES ────────────────────────────────────────────────────────────
console.log("\n🖼  Empty states");
const emptyDir = join(BRAND, "empty-states");
await png(svg("empty-clients"),   join(emptyDir, "empty-clients.png"),   560, 400);
await png(svg("empty-routines"),  join(emptyDir, "empty-routines.png"),  560, 400);
await png(svg("empty-exercises"), join(emptyDir, "empty-exercises.png"), 560, 400);

console.log("\n✅ Done! All brand assets exported.\n");
