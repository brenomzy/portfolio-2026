/*
 * Rebuilds the modal gallery screenshots from the manual PNG captures at the
 * same ratio as the current scroll videos (1918x944). No blurred background
 * fill: each screenshot is cover-cropped from the top-left so nav/hero context
 * stays stable and the modal gallery feels like one deliberate system.
 *
 * Run: node scripts/bake-gallery-shots.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "public", "work", "screenshots");
const TARGET = { width: 1918, height: 944 };

const PROJECTS = {
	verifone: ["verifone2", "verifone3", "verifone4"],
	buildops: ["buildops2", "buildops3", "buildops4"],
	gainbridge: ["gainbridge2", "gainbridge3", "gainbridge4"],
	"sharp-performance": [
		"sharpperformance2",
		"sharpperformance3",
		"sharpperformance4",
	],
};

const CROPS = {
	buildops2: { left: 326, top: 252, width: 810, height: 399 },
};

async function bake(src, outPath) {
	const crop = CROPS[src];
	let pipe = sharp(join(SRC, `${src}.png`));
	if (crop) pipe = pipe.extract(crop);

	await pipe
		.resize(TARGET.width, TARGET.height, {
			fit: "cover",
			position: "northwest",
			kernel: sharp.kernel.lanczos3,
		})
		.webp({ quality: 86 })
		.toFile(outPath);
}

for (const [slug, shots] of Object.entries(PROJECTS)) {
	const dir = join(ROOT, "public", "work", slug);
	mkdirSync(dir, { recursive: true });
	for (let i = 0; i < shots.length; i++) {
		await bake(shots[i], join(dir, `shot-${i + 1}.webp`));
	}
	console.log(`Baked public/work/${slug}/shot-1..${shots.length}.webp`);
}
