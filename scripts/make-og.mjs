/*
 * Generates public/og.png (1200×630) — the default social-share card.
 * One-off: run `node scripts/make-og.mjs` after editing. Rasterised from an
 * inline SVG via sharp (already a dependency of Astro). Uses a system sans so
 * it renders without bundling a webfont; swap for a designed card later.
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const out = fileURLToPath(new URL("../public/og.png", import.meta.url));

// Brand palette (from src/styles/tokens.css).
const BG = "#15130f"; // warm near-black
const CREAM = "#f3f0e8";
const MUTED = "#b3aa9c";
const ACCENT = "#ff5026"; // ≈ #FF4E2A brand

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="82%" cy="14%" r="55%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="${BG}"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g font-family="Segoe UI, Arial, Helvetica, sans-serif">
    <rect x="100" y="232" width="56" height="6" rx="3" fill="${ACCENT}"/>
    <text x="100" y="350" font-size="104" font-weight="800" fill="${CREAM}" letter-spacing="-3">Breno Daroz</text>
    <text x="100" y="416" font-size="40" font-weight="500" fill="${MUTED}">Design Engineer &#183; Webflow Developer</text>
    <text x="100" y="548" font-size="26" font-weight="600" fill="${MUTED}" letter-spacing="1">brenodaroz.com</text>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log("Wrote", out);
