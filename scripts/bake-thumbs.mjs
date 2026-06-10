/*
 * Bakes the REAL site screenshots (public/work/screenshots/<name>.png) into the
 * Work-section's floating-card thumbnails — replacing the stylised SVG
 * stand-ins (hybrid plan, step 2). Each output is a single 16:9 WebP:
 *   transparent margin  →  soft drop shadow  →  the screenshot (square card).
 * The transparent margin lets the theme-aware backdrop (--thumb-bg) and the 1px
 * cursor-glow border (CSS on .c-work__frame) keep working, and "one image per
 * cover" keeps the GSAP Flip cover→modal-hero flight untouched.
 *
 * Screenshots are cover-cropped from the TOP-LEFT (position 'northwest') so each
 * site's nav + headline survive (and wide captures keep their left-aligned
 * copy). Re-run: `node scripts/bake-thumbs.mjs`.
 */
import sharp from "sharp";
import { mkdirSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "public", "work", "screenshots");

// 16:9 stage; card large within it, leaving a slim transparent margin.
const W = 1600;
const H = 900;
const CARD = { x: 64, y: 52, w: 1472, h: 772 };

// Per-source vertical crop: keep this top fraction of the source height BEFORE
// the cover-fit, to drop a trailing section the capture caught (e.g. verifone1
// included the start of the next "Insights…" block under the Victa hero).
const KEEP_TOP = {
	// Crop just above the dark hero → white "Insights" boundary (~y948 of 1297)
	// so the card ends in black, not on the light section below.
	verifone1: 0.72,
};

// slug → [cover, ...gallery] source basenames (without .png)
const PROJECTS = {
	verifone: ["verifone1", "verifone2", "verifone3", "verifone4"],
	buildops: ["buildops1", "buildops2", "buildops3", "buildops4"],
	gainbridge: ["gainbridge1", "gainbridge2", "gainbridge3", "gainbridge4"],
	"sharp-performance": [
		"sharpperformance1",
		"sharpperformance2",
		"sharpperformance3",
		"sharpperformance4",
	],
};

// Soft drop shadow, baked as a blurred rounded rect via SVG (reliable smooth
// Gaussian — sharp's own .blur() gave a hard-edged falloff that read as a grey
// band/line under the card). The blur is generous and the shape is INSET inside
// the card footprint, so only the soft tail peeks past the card edges.
const shadowSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
	<defs><filter id="b" x="-20%" y="-20%" width="140%" height="160%">
		<feGaussianBlur stdDeviation="18"/>
	</filter></defs>
	<rect x="${CARD.x + 24}" y="${CARD.y + 34}" width="${CARD.w - 48}" height="${CARD.h - 48}"
		rx="4" fill="rgb(16,12,8)" fill-opacity="0.5" filter="url(#b)"/>
</svg>`;

async function bake(src, outPath) {
	let pipe = sharp(join(SRC, `${src}.png`));
	const keep = KEEP_TOP[src];
	if (keep) {
		const m = await sharp(join(SRC, `${src}.png`)).metadata();
		pipe = pipe.extract({
			left: 0,
			top: 0,
			width: m.width,
			height: Math.round(m.height * keep),
		});
	}
	const shot = await pipe
		.resize(CARD.w, CARD.h, { fit: "cover", position: "northwest" })
		.toBuffer();
	const shadow = await sharp(Buffer.from(shadowSvg)).png().toBuffer();
	await sharp({
		create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
	})
		.composite([
			{ input: shadow, top: 0, left: 0 },
			{ input: shot, top: CARD.y, left: CARD.x },
		])
		.webp({ quality: 86 })
		.toFile(outPath);
}

for (const [slug, shots] of Object.entries(PROJECTS)) {
	const dir = join(ROOT, "public", "work", slug);
	mkdirSync(dir, { recursive: true });
	// Drop the superseded stylised SVG stand-ins.
	for (const f of ["cover.svg", "shot-1.svg", "shot-2.svg"]) {
		const p = join(dir, f);
		if (existsSync(p)) rmSync(p);
	}
	await bake(shots[0], join(dir, "cover.webp"));
	for (let i = 1; i < shots.length; i++) {
		await bake(shots[i], join(dir, `shot-${i}.webp`));
	}
	console.log(`Baked public/work/${slug}/{cover,shot-1..${shots.length - 1}}.webp`);
}
