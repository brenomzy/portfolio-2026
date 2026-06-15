/*
 * Bakes the raw WhatsApp photos in public/about/gallery/ into optimised WebP:
 *   - the homepage portrait (Breno + cat) → public/about/portrait.webp, 3:4
 *     (the AboutSection img is object-fit:cover at aspect-ratio 3/4)
 *   - seven gallery cards → public/about/gallery/g-1..7.webp, 2:3 portrait
 *     (the Osmo flick card is cover-cropped at padding-top:150%)
 *
 * Cover-crop with `position: attention` so sharp keeps the most salient region
 * (faces) when it trims to the target ratio. WebP q82 — these are photos, not UI.
 *
 * Raw .jpeg sources live in scripts/sources/about-photos/ (NOT public/, so they
 * don't ship); only the optimised WebP land in public/. Re-run after adding or
 * swapping sources: `node scripts/make-about-photos.mjs`.
 */
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "scripts", "sources", "about-photos");
const SRC = join(ROOT, "public", "about", "gallery");
const ABOUT = join(ROOT, "public", "about");

// Source order → gallery slot. g-1 (cat + workspace) is also the homepage
// portrait, and sits first so it's the active/centre card on load.
const PHOTOS = [
	["g-1", "WhatsApp Image 2026-06-14 at 16.17.05 (1).jpeg"], // Breno + cat, desk
	["g-2", "WhatsApp Image 2026-06-14 at 16.17.05.jpeg"], //     couple
	["g-3", "WhatsApp Image 2026-06-14 at 16.17.05 (2).jpeg"], // cat nuzzle
	["g-4", "WhatsApp Image 2026-06-14 at 16.17.06.jpeg"], //     cat in the tree
	["g-5", "WhatsApp Image 2026-06-14 at 16.17.06 (1).jpeg"], // Breno + baby
	["g-6", "WhatsApp Image 2026-06-14 at 16.17.06 (2).jpeg"], // the dog
	["g-7", "WhatsApp Image 2026-06-14 at 16.17.06 (3).jpeg"], // family
];

const PORTRAIT_SRC = "WhatsApp Image 2026-06-14 at 16.17.05 (1).jpeg";

mkdirSync(SRC, { recursive: true });

// Gallery cards: 2:3 portrait, ~720x1080 (≈3x the ~256px display width).
for (const [slug, file] of PHOTOS) {
	const dest = join(SRC, `${slug}.webp`);
	const { width, height } = await sharp(join(RAW, file))
		.rotate() // honour EXIF orientation
		.resize(720, 1080, { fit: "cover", position: sharp.strategy.attention })
		.webp({ quality: 82 })
		.toFile(dest);
	console.log(`✓ gallery/${slug}.webp  ${width}x${height}`);
}

// Homepage portrait: 3:4, ~720x960.
const pdest = join(ABOUT, "portrait.webp");
const { width, height } = await sharp(join(RAW, PORTRAIT_SRC))
	.rotate()
	.resize(720, 960, { fit: "cover", position: sharp.strategy.attention })
	.webp({ quality: 82 })
	.toFile(pdest);
console.log(`✓ portrait.webp  ${width}x${height}`);

console.log("\nDone.");
