/*
 * Generates public/grain.png — a 128×128 monochrome film-grain tile used by the
 * site-wide grain overlay (see global.css `body::before`). Crisp per-pixel grain
 * to match the Nuts (nutsdev.com) look: a real noise texture tiled at natural
 * size, rather than a soft SVG feTurbulence. Deterministic (seeded) so re-runs
 * produce the identical asset. Run: `node scripts/gen-grain.mjs`.
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const N = 128;

// Seeded LCG → triangular-distributed grey centred on 128 (film-grain feel).
let s = 1337;
const rnd = () => {
	s = (s * 1103515245 + 12345) & 0x7fffffff;
	return s / 0x7fffffff;
};

// Grayscale, 8-bit (PNG colour type 0): one byte per pixel, each row prefixed
// with a filter byte (0 = none).
const raw = Buffer.alloc(N * (N + 1));
let p = 0;
for (let y = 0; y < N; y++) {
	raw[p++] = 0; // filter: none
	for (let x = 0; x < N; x++) {
		const g = (rnd() + rnd()) * 0.5; // triangular around 0.5
		raw[p++] = Math.max(0, Math.min(255, Math.round(128 + (g - 0.5) * 255)));
	}
}

// --- minimal PNG encoder -------------------------------------------------
const crcTable = (() => {
	const t = new Uint32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		t[n] = c >>> 0;
	}
	return t;
})();
const crc32 = (buf) => {
	let c = 0xffffffff;
	for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
	return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
	const len = Buffer.alloc(4);
	len.writeUInt32BE(data.length, 0);
	const typeBuf = Buffer.from(type, "ascii");
	const body = Buffer.concat([typeBuf, data]);
	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(crc32(body), 0);
	return Buffer.concat([len, body, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(N, 0);
ihdr.writeUInt32BE(N, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 0; // colour type: grayscale
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter
ihdr[12] = 0; // interlace

const png = Buffer.concat([
	Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
	chunk("IHDR", ihdr),
	chunk("IDAT", deflateSync(raw, { level: 9 })),
	chunk("IEND", Buffer.alloc(0)),
]);

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "grain.png");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, png);
console.log(`Wrote ${out} (${png.length} bytes)`);
