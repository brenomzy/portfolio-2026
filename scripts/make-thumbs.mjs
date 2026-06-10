/*
 * Generates the Work-section thumbnails + modal gallery shots as self-contained
 * SVGs (public/work/<slug>/cover.svg, shot-1.svg, shot-2.svg).
 *
 * Each composite is the "floating browser card on brand colour" treatment
 * (harshshah.design idiom): a brand-coloured background with a rounded browser
 * card floating on a soft shadow, the card showing a faithful re-creation of
 * that site's hero — real wordmark, eyebrow, headline, CTAs and a motif, in the
 * brand's own palette. These are STYLISED stand-ins (v1 of the hybrid plan),
 * built to be swapped for real screenshots later without touching the layout:
 * each file is one 16:9 image, so the GSAP Flip cover→modal-hero flight stays
 * distortion-free. Re-run: `node scripts/make-thumbs.mjs`.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = 1600;
const H = 900;

// Card geometry (shared by every composite). The card is large within the 16:9
// frame, leaving a slim transparent margin: the SVG carries NO background of its
// own, so the page's theme-aware gradient (set in CSS on the media container)
// shows through the margin and reacts to light/dark.
const CARD = { x: 64, y: 52, w: 1472, h: 772, r: 0 };
const CHROME = 52; // browser chrome-bar height
const PAGE = {
	x: CARD.x,
	y: CARD.y + CHROME,
	w: CARD.w,
	h: CARD.h - CHROME,
};
const PAD = 60; // inner page padding
const IN = { x: PAGE.x + PAD, y: PAGE.y + PAD, w: PAGE.w - PAD * 2 }; // content origin

const SANS = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace";

// --- tiny SVG helpers ----------------------------------------------------
const esc = (s) =>
	String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function text(x, y, str, o = {}) {
	const {
		size = 28,
		weight = 400,
		fill = "#000",
		spacing = 0,
		family = SANS,
		anchor = "start",
		opacity = 1,
	} = o;
	return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" letter-spacing="${spacing}" text-anchor="${anchor}" opacity="${opacity}">${esc(str)}</text>`;
}

function lines(x, y, arr, o = {}) {
	const { lh = (o.size || 64) * 1.05 } = o;
	return arr
		.map((l, i) => text(x, y + i * lh, l, o))
		.join("");
}

function rr(x, y, w, h, r, attrs = "") {
	return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ${attrs}/>`;
}

function button(x, y, label, o = {}) {
	const { fill = "#000", text: tc = "#fff", w, ghost = false, size = 22 } = o;
	const bw = w ?? label.length * size * 0.62 + 56;
	const bh = 52;
	const rect = ghost
		? rr(x, y, bw, bh, 10, `fill="none" stroke="${tc}" stroke-opacity="0.4"`)
		: rr(x, y, bw, bh, 10, `fill="${fill}"`);
	return (
		rect +
		text(x + bw / 2, y + bh / 2 + size * 0.34, label, {
			size,
			weight: 600,
			fill: ghost ? tc : tc,
			family: SANS,
			anchor: "middle",
		})
	);
}

function eyebrow(x, y, str, o = {}) {
	const { fill = "#888", mark } = o;
	const m = mark
		? `<rect x="${x}" y="${y - 13}" width="16" height="16" rx="3" fill="${mark}"/>`
		: "";
	const tx = mark ? x + 26 : x;
	return (
		m +
		text(tx, y, str, {
			size: 15,
			weight: 600,
			fill,
			spacing: 2.5,
			family: MONO,
		})
	);
}

// browser chrome bar (3 dots + url pill)
function chrome(spec) {
	const dark = spec.chrome === "dark";
	const barFill = dark ? "#1c1c1c" : "#ececec";
	const dot = dark ? "#3a3a3a" : null;
	const dots = ["#ff5f57", "#febc2e", "#28c840"]
		.map(
			(c, i) =>
				`<circle cx="${CARD.x + 32 + i * 24}" cy="${CARD.y + CHROME / 2}" r="7" fill="${dot || c}"/>`,
		)
		.join("");
	const pillW = 360;
	const pillX = CARD.x + CARD.w / 2 - pillW / 2;
	const pill =
		rr(pillX, CARD.y + 13, pillW, CHROME - 26, 13, `fill="${dark ? "#2a2a2a" : "#fff"}"`) +
		text(pillX + pillW / 2, CARD.y + CHROME / 2 + 5, spec.url, {
			size: 15,
			fill: dark ? "#9a9a9a" : "#7a7a7a",
			anchor: "middle",
			family: MONO,
		});
	return `<rect x="${CARD.x}" y="${CARD.y}" width="${CARD.w}" height="${CHROME}" fill="${barFill}"/>${dots}${pill}`;
}

// shared navbar inside the page (wordmark + faint links + cta)
function navbar(spec) {
	const ny = PAGE.y + 56;
	const wm = wordmark(spec, IN.x, ny);
	const links = (spec.nav || [])
		.map((l, i) =>
			text(IN.x + 360 + i * 130, ny + 6, l, {
				size: 17,
				fill: spec.muted,
				family: SANS,
			}),
		)
		.join("");
	const cta = button(IN.x + IN.w - 170, ny - 22, spec.navCta || "Get Started", {
		fill: spec.accent,
		text: spec.accentInk,
		w: 170,
		size: 18,
	});
	return wm + links + cta;
}

function wordmark(spec, x, y) {
	const mark = spec.markGlyph ? spec.markGlyph(x, y) : "";
	const tx = spec.markGlyph ? x + 42 : x;
	return (
		mark +
		text(tx, y + 9, spec.wordmark, {
			size: 26,
			weight: 700,
			fill: spec.ink,
			family: SANS,
			spacing: spec.wordmarkSpacing ?? 0,
		})
	);
}

// --- frame: floating card on a TRANSPARENT canvas, content injected via fn --
// No background rect: the card floats on transparency so the media container's
// theme-aware gradient (CSS) shows through the margin. A soft drop shadow grounds
// the card; it composites over whatever sits behind in the page.
function composite(spec, contentFn, extraDefs = "") {
	const defs = `<defs>
		<filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
			<feDropShadow dx="0" dy="22" stdDeviation="30" flood-color="${spec.shadow}" flood-opacity="0.34"/>
		</filter>
		<clipPath id="card"><rect x="${CARD.x}" y="${CARD.y}" width="${CARD.w}" height="${CARD.h}" rx="${CARD.r}"/></clipPath>
		${extraDefs}
	</defs>`;
	return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img">
${defs}
<rect x="${CARD.x}" y="${CARD.y}" width="${CARD.w}" height="${CARD.h}" rx="${CARD.r}" fill="${spec.pageBg}" filter="url(#shadow)"/>
<g clip-path="url(#card)">
	<rect x="${PAGE.x}" y="${PAGE.y}" width="${PAGE.w}" height="${PAGE.h}" fill="${spec.pageBg}"/>
	${chrome(spec)}
	${contentFn(spec)}
</g>
<rect x="${CARD.x}" y="${CARD.y}" width="${CARD.w}" height="${CARD.h}" rx="${CARD.r}" fill="none" stroke="#ffffff" stroke-opacity="0.10"/>
</svg>`;
}

// --- reusable gallery panels ---------------------------------------------
function galleryFeatures(spec) {
	const top = PAGE.y + 160;
	const head = text(IN.x, top, spec.featuresTitle, {
		size: 40,
		weight: 600,
		fill: spec.ink,
	});
	const cardW = (IN.w - 48) / 3;
	const cards = spec.features
		.map((f, i) => {
			const cx = IN.x + i * (cardW + 24);
			const cy = top + 60;
			const ch = PAGE.h - 220 - 60;
			return (
				rr(cx, cy, cardW, ch, 14, `fill="${spec.tile}"`) +
				rr(cx + 28, cy + 28, 48, 48, 11, `fill="${spec.accent}"`) +
				text(cx + 28, cy + 122, f.title, {
					size: 24,
					weight: 600,
					fill: spec.ink,
				}) +
				lines(cx + 28, cy + 160, f.desc, {
					size: 16,
					fill: spec.muted,
					lh: 24,
				})
			);
		})
		.join("");
	return navbarLite(spec) + head + cards;
}

function galleryStats(spec) {
	const top = PAGE.y + 150;
	const head = lines(IN.x, top, spec.statsTitle, {
		size: 46,
		weight: 600,
		fill: spec.ink,
		lh: 54,
	});
	const sy = top + spec.statsTitle.length * 54 + 70;
	const colW = IN.w / spec.stats.length;
	const stats = spec.stats
		.map((s, i) => {
			const cx = IN.x + i * colW;
			const div =
				i > 0
					? `<rect x="${cx - 1}" y="${sy - 36}" width="1.5" height="120" fill="${spec.ink}" opacity="0.14"/>`
					: "";
			return (
				div +
				text(cx + 4, sy, s.big, {
					size: 52,
					weight: 700,
					fill: spec.accentText || spec.ink,
				}) +
				lines(cx + 4, sy + 40, s.label, { size: 16, fill: spec.muted, lh: 22 })
			);
		})
		.join("");
	return navbarLite(spec) + head + stats;
}

function navbarLite(spec) {
	const ny = PAGE.y + 52;
	return (
		wordmark(spec, IN.x, ny) +
		button(IN.x + IN.w - 170, ny - 22, spec.navCta || "Get Started", {
			fill: spec.accent,
			text: spec.accentInk,
			w: 170,
			size: 18,
		})
	);
}

// =========================================================================
// Brand specs + bespoke hero content
// =========================================================================
const specs = {};

// ---- Verifone -----------------------------------------------------------
specs.verifone = {
	slug: "verifone",
	bg: ["#7fd9c4", "#3fae9a"],
	pageBg: "#fafbfb",
	tile: "#f1f4f3",
	chrome: "light",
	url: "verifone.com",
	shadow: "#0c3a31",
	glow: 0.18,
	ink: "#0a1f1a",
	muted: "#6b7b76",
	accent: "#0a1f1a",
	accentInk: "#ffffff",
	accentText: "#0a8f76",
	wordmark: "verifone",
	wordmarkSpacing: -0.5,
	nav: ["Platform", "Devices", "Solutions", "Developers"],
	navCta: "Contact sales",
	eyebrow: "EMPOWERING COMMERCE",
	headline: ["Unified payments,", "boundless commerce."],
	sub: ["One platform connecting devices, software,", "and services across 165+ countries."],
	cta: "Explore platform",
	cta2: "Watch film",
	featuresTitle: "One platform, every channel",
	features: [
		{ title: "In-store", desc: ["Smart terminals built", "for any counter."] },
		{ title: "Online", desc: ["Hosted checkout and", "payment APIs."] },
		{ title: "Mobile", desc: ["Tap to pay on any", "modern device."] },
	],
	statsTitle: ["Trusted by commerce", "at global scale."],
	stats: [
		{ big: "$8T+", label: ["transactions", "processed"] },
		{ big: "165+", label: ["countries", "served"] },
		{ big: "40+", label: ["years of", "expertise"] },
		{ big: "99.99%", label: ["platform", "uptime"] },
	],
};
specs.verifone.markGlyph = (x, y) =>
	`<path d="M${x} ${y - 14} l10 26 l10 -26" fill="none" stroke="#0a1f1a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
specs.verifone.hero = (s) => {
	const lx = IN.x;
	const ty = PAGE.y + 230;
	const left =
		eyebrow(lx, ty - 96, s.eyebrow, { fill: s.accentText }) +
		lines(lx, ty, s.headline, { size: 70, weight: 700, fill: s.ink, spacing: -2, lh: 76 }) +
		lines(lx, ty + 130, s.sub, { size: 21, fill: s.muted, lh: 30 }) +
		button(lx, ty + 200, s.cta, { fill: s.accent, text: "#fff", size: 20 }) +
		button(lx + 250, ty + 200, s.cta2, { ghost: true, text: s.ink, size: 20, w: 180 });
	// motif: mint payment terminal
	const mx = IN.x + IN.w - 360;
	const my = PAGE.y + 150;
	const dev =
		rr(mx, my, 320, 430, 28, `fill="#dff3ee" stroke="#bfe6dd"`) +
		rr(mx + 30, my + 34, 260, 150, 12, `fill="#0a1f1a"`) +
		text(mx + 50, my + 120, "$248.00", { size: 34, weight: 700, fill: "#7fd9c4", family: MONO }) +
		Array.from({ length: 12 })
			.map((_, i) =>
				rr(
					mx + 30 + (i % 3) * 90,
					my + 220 + Math.floor(i / 3) * 50,
					70,
					36,
					8,
					`fill="#eef6f3"`,
				),
			)
			.join("");
	return navbar(s) + left + dev;
};

// ---- BuildOps -----------------------------------------------------------
specs.buildops = {
	slug: "buildops",
	bg: ["#114a35", "#08251a"],
	pageBg: "#0f2a20",
	tile: "#16382b",
	chrome: "dark",
	url: "buildops.com",
	shadow: "#04130d",
	ink: "#f4f8f5",
	muted: "#8fb3a4",
	accent: "#f5c518",
	accentInk: "#10231b",
	accentText: "#f5c518",
	wordmark: "BuildOps",
	nav: ["Platform", "Solutions", "Customers", "Pricing"],
	navCta: "Book Demo",
	eyebrow: "MISSION CONTROL FOR CONTRACTORS",
	headline: ["More jobs.", "More margin.", "Less chaos."],
	sub: ["Connect projects, service, and financials", "in one AI-native platform."],
	cta: "Book Demo",
	cta2: "Join Weekly Demo",
	featuresTitle: "Built to perform",
	features: [
		{ title: "Service", desc: ["First call to", "final invoice."] },
		{ title: "Projects", desc: ["Run jobs from bid", "to closeout."] },
		{ title: "Financials", desc: ["Track every dollar,", "every job."] },
	],
	statsTitle: ["Trusted by 1,500+", "commercial contractors."],
	stats: [
		{ big: "75%", label: ["quote approval", "rates"] },
		{ big: "1,500+", label: ["contractors", "on platform"] },
		{ big: "AI", label: ["native", "operations"] },
		{ big: "4x", label: ["Forbes best", "employer"] },
	],
};
specs.buildops.markGlyph = (x, y) =>
	[0, 1, 2]
		.map(
			(i) =>
				`<path d="M${x} ${y - 6 + i * 9} l13 7 l13 -7" fill="none" stroke="#34c77b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
		)
		.join("");
specs.buildops.hero = (s) => {
	const lx = IN.x;
	const ty = PAGE.y + 210;
	const left =
		eyebrow(lx, ty - 70, s.eyebrow, { fill: "#34c77b" }) +
		lines(lx, ty, s.headline, { size: 66, weight: 800, fill: s.ink, spacing: -1.5, lh: 64 }) +
		lines(lx, ty + 150, s.sub, { size: 20, fill: s.muted, lh: 29 }) +
		button(lx, ty + 220, s.cta, { fill: s.accent, text: s.accentInk, size: 20 }) +
		button(lx + 200, ty + 220, s.cta2, { ghost: true, text: s.ink, size: 20, w: 220 });
	// motif: field-photo tile with a gauge cluster (HVAC nod)
	const mx = IN.x + IN.w - 430;
	const my = PAGE.y + 130;
	const tile =
		`<defs><linearGradient id="bo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b6b4f"/><stop offset="1" stop-color="#0c2118"/></linearGradient></defs>` +
		rr(mx, my, 400, 470, 18, `fill="url(#bo)"`) +
		`<circle cx="${mx + 150}" cy="${my + 250}" r="74" fill="none" stroke="#cfe9dc" stroke-width="10"/>` +
		`<circle cx="${mx + 270}" cy="${my + 300}" r="56" fill="none" stroke="#f5c518" stroke-width="9"/>` +
		`<line x1="${mx + 150}" y1="${my + 250}" x2="${mx + 200}" y2="${my + 210}" stroke="#cfe9dc" stroke-width="8" stroke-linecap="round"/>` +
		`<line x1="${mx + 270}" y1="${my + 300}" x2="${mx + 240}" y2="${my + 262}" stroke="#f5c518" stroke-width="7" stroke-linecap="round"/>`;
	return navbar(s) + left + tile;
};

// ---- Gainbridge ---------------------------------------------------------
specs.gainbridge = {
	slug: "gainbridge",
	bg: ["#26241f", "#100f0c"],
	pageBg: "#1a1916",
	tile: "#26241f",
	chrome: "dark",
	url: "gainbridge.com",
	shadow: "#000000",
	ink: "#f6f4f0",
	muted: "#9c968b",
	accent: "#f2c200",
	accentInk: "#1a1916",
	accentText: "#f2c200",
	wordmark: "GAINBRIDGE",
	wordmarkSpacing: 0.5,
	nav: ["Save", "Learn", "Company", "Reviews"],
	navCta: "Get Started",
	eyebrow: "SAVE SMARTER",
	headline: ["Earn up to", "6.00%"],
	sub: ["You work hard. Your savings can too.", "Guaranteed growth, no hidden fees."],
	cta: "Get Started",
	cta2: "Learn More",
	featuresTitle: "Built to make saving simpler",
	features: [
		{ title: "Guaranteed rates", desc: ["Lock in a rate you", "can count on."] },
		{ title: "Principal protected", desc: ["Your savings stay", "100% protected."] },
		{ title: "Flexible savings", desc: ["Access built around", "your goals."] },
	],
	statsTitle: ["The numbers behind", "your peace of mind."],
	stats: [
		{ big: "6.00%", label: ["guaranteed", "rate"] },
		{ big: "$81B+", label: ["assets under", "management"] },
		{ big: "100%", label: ["principal", "protected"] },
		{ big: "Zero", label: ["hidden", "fees"] },
	],
};
specs.gainbridge.markGlyph = (x, y) =>
	`<path d="M${x} ${y - 12} l22 11 l-22 11 z" fill="#f2c200"/>`;
specs.gainbridge.hero = (s) => {
	const lx = IN.x;
	const ty = PAGE.y + 240;
	const left =
		eyebrow(lx, ty - 130, s.eyebrow, { fill: s.muted, mark: s.accent }) +
		lines(lx, ty, s.headline, { size: 92, weight: 700, fill: s.ink, spacing: -2.5, lh: 92 }) +
		lines(lx, ty + 162, s.sub, { size: 20, fill: s.muted, lh: 29 }) +
		button(lx, ty + 234, s.cta, { fill: s.accent, text: s.accentInk, size: 20 }) +
		button(lx + 220, ty + 234, s.cta2, { ghost: true, text: s.ink, size: 20, w: 180 });
	// motif: warm gradient tile with an upward growth line
	const mx = IN.x + IN.w - 430;
	const my = PAGE.y + 120;
	const tw = 400, th = 360;
	const pts = [0, 1, 2, 3, 4, 5]
		.map((i) => `${mx + 30 + i * 68},${my + th - 40 - i * i * 8 - 20}`)
		.join(" ");
	const tile =
		`<defs><linearGradient id="gb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c98a3a"/><stop offset="1" stop-color="#7a3f1d"/></linearGradient></defs>` +
		rr(mx, my, tw, th, 18, `fill="url(#gb)"`) +
		`<polyline points="${pts}" fill="none" stroke="#f2c200" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>` +
		text(mx + 30, my + 70, "$81B+", { size: 40, weight: 700, fill: "#fff", family: MONO }) +
		text(mx + 30, my + 100, "managed", { size: 16, fill: "#ffe7c2", family: MONO });
	return navbar(s) + left + tile;
};

// ---- Sharp Performance --------------------------------------------------
specs.sharp = {
	slug: "sharp-performance",
	bg: ["#c3b178", "#8c7a44"],
	pageBg: "#08080a",
	tile: "#141414",
	chrome: "dark",
	url: "sharpperformance.com",
	shadow: "#3a3015",
	glow: 0.06,
	ink: "#f3f1ea",
	muted: "#8a8884",
	accent: "#cdbe86",
	accentInk: "#0c0c0c",
	accentText: "#cdbe86",
	wordmark: "SHARP",
	wordmarkSpacing: 3,
	nav: [],
	navCta: "Menu",
	eyebrow: "DEVELOPED BY U.S. SPECIAL OPERATORS",
	headline: ["Personal coaching", "for professionals in", "high-risk occupations."],
	sub: ["Mental performance training from the", "psychologists who trained the operators."],
	cta: "Get In Touch",
	featuresTitle: "The Sharp method",
	features: [
		{ title: "Assess", desc: ["Baseline your mental", "performance."] },
		{ title: "Train", desc: ["1:1 coaching built", "for the field."] },
		{ title: "Perform", desc: ["Sustain focus under", "real pressure."] },
	],
	statsTitle: ["Built with the people", "who operate at the edge."],
	stats: [
		{ big: "1:1", label: ["personal", "coaching"] },
		{ big: "20+", label: ["years of", "research"] },
		{ big: "100%", label: ["confidential", "by design"] },
	],
};
specs.sharp.markGlyph = (x, y) =>
	`<path d="M${x + 16} ${y - 14} l16 9 v18 l-16 9 l-16 -9 v-18 z" fill="none" stroke="#cdbe86" stroke-width="3"/><circle cx="${x + 16}" cy="${y + 4}" r="5" fill="#cdbe86"/>`;
specs.sharp.wordmark = "SHARP  PERFORMANCE";
specs.sharp.hero = (s) => {
	const lx = IN.x;
	const ty = PAGE.y + 250;
	const left =
		eyebrow(lx, ty - 120, s.eyebrow, { fill: s.accent }) +
		lines(lx, ty, s.headline, { size: 58, weight: 700, fill: s.ink, spacing: -1, lh: 62 }) +
		lines(lx, ty + 210, s.sub, { size: 19, fill: s.muted, lh: 28 }) +
		button(lx, ty + 280, s.cta, { ghost: true, text: s.accent, size: 20, w: 220 });
	// motif: reticle + particle field
	const cx = IN.x + IN.w - 230;
	const cy = PAGE.y + 320;
	let dots = "";
	let seed = 7;
	const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
	for (let i = 0; i < 90; i++) {
		const a = rnd() * Math.PI * 2;
		const r = 40 + rnd() * 190;
		dots += `<circle cx="${(cx + Math.cos(a) * r).toFixed(1)}" cy="${(cy + Math.sin(a) * r).toFixed(1)}" r="${(rnd() * 2 + 0.6).toFixed(1)}" fill="#cdbe86" opacity="${(0.25 + rnd() * 0.6).toFixed(2)}"/>`;
	}
	const reticle =
		`<circle cx="${cx}" cy="${cy}" r="60" fill="none" stroke="#cdbe86" stroke-width="2" opacity="0.8"/>` +
		`<circle cx="${cx}" cy="${cy}" r="6" fill="none" stroke="#cdbe86" stroke-width="2"/>` +
		["M-90,0 h40", "M50,0 h40", "M0,-90 v40", "M0,50 v40"]
			.map(
				(d) =>
					`<path d="${d}" transform="translate(${cx} ${cy})" stroke="#cdbe86" stroke-width="2" opacity="0.8"/>`,
			)
			.join("");
	return navbar(s) + left + dots + reticle;
};

// =========================================================================
// Emit
// =========================================================================
for (const key of Object.keys(specs)) {
	const s = specs[key];
	const dir = join(ROOT, "public", "work", s.slug);
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, "cover.svg"), composite(s, s.hero));
	writeFileSync(join(dir, "shot-1.svg"), composite(s, galleryFeatures));
	writeFileSync(join(dir, "shot-2.svg"), composite(s, galleryStats));
	console.log(`Wrote public/work/${s.slug}/{cover,shot-1,shot-2}.svg`);
}
