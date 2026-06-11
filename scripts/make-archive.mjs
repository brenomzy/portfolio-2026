/*
 * Downloads the "more work" marquee images from the old Webflow site and bakes
 * them into optimised WebP under public/archive/<slug>.webp.
 *
 * Source images are 900x650 PNGs on the Webflow CDN. We keep native size (at the
 * marquee's ~360px display width that's already ~2.5x DPR — no upscale needed),
 * apply a gentle sharpen to recover crispness lost in the PNG→WebP pass, and
 * emit WebP for the byte savings. Re-run: `node scripts/make-archive.mjs`.
 */
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "archive");
const CDN = "https://cdn.prod.website-files.com/65e77e5fb86825d854cabccd";

// slug -> source filename on the Webflow CDN. Order here is the source order; the
// component splits/​interleaves across the two rows.
const PROJECTS = [
	["minu-portfolio", "65edeb07d8b79ade043a4087_portfolio-minu.png"],
	["minu-landing", "65edeb10188fb988d1753bcc_landing-minu.png"],
	["ligapj", "65edeb19be8ebe269f9c7254_ligapj.png"],
	["coucoo", "65edeb243543df2a0c83085d_coucoo.png"],
	["domaine-uma", "65edeae86b0dcf94697390d1_domaine-uma.png"],
	["folie-douce", "65edeb338d0f6e270aa121b4_folie-douce.png"],
	["storia-business", "65edeb3b0fba565cde467b07_storia-business.png"],
	["dsg", "65edeb43f7c278631aa9d441_dsg.png"],
];

mkdirSync(OUT, { recursive: true });

for (const [slug, file] of PROJECTS) {
	const url = `${CDN}/${file}`;
	const res = await fetch(url);
	if (!res.ok) {
		console.error(`✗ ${slug}: ${res.status} ${res.statusText}`);
		continue;
	}
	const buf = Buffer.from(await res.arrayBuffer());
	const dest = join(OUT, `${slug}.webp`);
	const { width, height } = await sharp(buf)
		.sharpen({ sigma: 0.6 }) // light unsharp — subtle, no halos
		.webp({ quality: 86 })
		.toFile(dest);
	console.log(`✓ ${slug}.webp  ${width}x${height}`);
}

console.log("\nDone.");
