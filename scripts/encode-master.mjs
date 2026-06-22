/*
 * Turns a hand-recorded master (e.g. an OBS .mkv/.mp4 scroll capture) into the
 * web-ready files the case-study device mockups use: a vp9 webm + h264 mp4
 * fallback + a webp poster, scaled to target and trimmed to the good part.
 *
 *   node scripts/encode-master.mjs <input> <slug> <desktop|mobile> [options]
 *
 * Options:
 *   --trim-start <s>   drop this many seconds from the start (default 0)
 *   --trim-end <s>     stop at this timestamp in the SOURCE (default = end)
 *   --scale <w:h>      ffmpeg scale (default desktop 1920:-2, mobile 780:-2)
 *   --poster <s>       source timestamp for the poster frame (default trim-start + 0.3)
 *   --crf-webm <n>     vp9 quality (default 34; lower = sharper/bigger)
 *   --crf-mp4 <n>      h264 quality (default 24)
 *
 * Example:
 *   node scripts/encode-master.mjs recordings/buildops.mkv buildops desktop --trim-start 1.5 --trim-end 19
 *
 * Output → public/work/<slug>/scroll-<device>.{webm,mp4} + -poster.webp
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, isAbsolute } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);

const [input, slug, device] = argv;
if (!input || !slug || !["desktop", "mobile"].includes(device)) {
	console.error("Usage: node scripts/encode-master.mjs <input> <slug> <desktop|mobile> [--trim-start s] [--trim-end s] [--scale w:h] [--poster s] [--crf-webm n] [--crf-mp4 n]");
	process.exit(1);
}

const opt = (name, def) => {
	const i = argv.indexOf(`--${name}`);
	return i !== -1 && argv[i + 1] ? argv[i + 1] : def;
};

const inPath = isAbsolute(input) ? input : join(ROOT, input);
if (!existsSync(inPath)) {
	console.error(`Input not found: ${inPath}`);
	process.exit(1);
}

const trimStart = parseFloat(opt("trim-start", "0"));
const trimEnd = opt("trim-end", null); // source timestamp
const scale = opt("scale", device === "mobile" ? "780:-2" : "1920:-2");
const posterAt = opt("poster", (trimStart + 0.3).toFixed(2));
const crfWebm = opt("crf-webm", "34");
const crfMp4 = opt("crf-mp4", "24");

const outDir = join(ROOT, "public", "work", slug);
mkdirSync(outDir, { recursive: true });
const outBase = join(outDir, `scroll-${device}`);

const ff = (args) => execFileSync("ffmpeg", ["-y", ...args], { stdio: "inherit" });

// Trim: -ss before -i (fast seek); -to gives an absolute SOURCE timestamp, so
// it must account for the seek — use -t (duration) instead when both are set.
const seek = trimStart > 0 ? ["-ss", String(trimStart)] : [];
const dur = trimEnd ? ["-t", String(parseFloat(trimEnd) - trimStart)] : [];
const vf = `scale=${scale}:flags=lanczos`;

console.log(`[${slug}/${device}] webm…`);
ff([...seek, "-i", inPath, ...dur, "-an", "-vf", vf, "-c:v", "libvpx-vp9", "-crf", crfWebm, "-b:v", "0", "-row-mt", "1", "-pix_fmt", "yuv420p", `${outBase}.webm`]);

console.log(`[${slug}/${device}] mp4…`);
ff([...seek, "-i", inPath, ...dur, "-an", "-vf", vf, "-c:v", "libx264", "-crf", crfMp4, "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", `${outBase}.mp4`]);

console.log(`[${slug}/${device}] poster…`);
ff(["-ss", String(posterAt), "-i", inPath, "-frames:v", "1", "-vf", vf, `${outBase}-poster.webp`]);

console.log(`[${slug}/${device}] done → public/work/${slug}/`);
