/*
 * Captures crisp, high-framerate scroll videos of a project's live site for the
 * case-study device mockups.
 *
 * Approach: instead of the realtime recorder (capped at CSS-pixel resolution +
 * ~25fps, and prone to relayout glitches), we drive the scroll DETERMINISTICALLY
 * — set an eased scroll position per frame, wait for paint, and screenshot at 2×
 * (retina) density. ffmpeg then assembles the frames at a chosen fps and
 * supersamples them down to the target size. Result: sharp, exactly-60fps,
 * glitch-free, with file size controlled purely by the encoder's CRF.
 *
 *   node scripts/capture-scroll.mjs buildops
 *
 * Output → public/work/<slug>/:
 *   scroll-desktop.webm  scroll-desktop.mp4  scroll-desktop-poster.webp
 *
 * Dev-only build step — nothing here ships in the bundle except the final media.
 */
import { chromium, devices } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, copyFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Consent UIs to hide at load so they never flash in frame. OneTrust covers
// most marketing sites; the generic patterns catch the rest. Per-site
// `hideConsent` extends this list.
const HIDE_CONSENT = [
	"#onetrust-consent-sdk",
	"#onetrust-banner-sdk",
	".onetrust-pc-dark-filter",
	'[id*="onetrust" i]',
	'[class*="ot-sdk" i]',
	'[id*="cookie-banner" i]',
	'[class*="cookie-banner" i]',
	'[aria-label*="cookie" i]',
];

// --- per-site config -----------------------------------------------------
const SITES = {
	buildops: {
		url: "https://buildops.com/",
		consent: ["I Understand"], // shadow-DOM cookie notice — hidden + click fallback
	},
};

// Hide consent UIs as soon as they appear — no banner flash. These load late
// and often live in a shadow DOM (BuildOps' does), so a static CSS rule can't
// reach them. Poll for ~10s: hide light-DOM matches by selector AND any shadow
// host whose content reads like a cookie notice.
function consentHideScript(sels) {
	const KW = /by continuing|i understand|manage cookies|cookie settings|cookie policy|consent/i;
	const sel = sels.join(",");
	const sweep = () => {
		document.querySelectorAll(sel).forEach((e) => e.style.setProperty("display", "none", "important"));
		document.querySelectorAll("*").forEach((e) => {
			if (e.shadowRoot && KW.test(e.shadowRoot.textContent || "")) {
				e.style.setProperty("display", "none", "important");
			}
		});
	};
	const iv = setInterval(sweep, 250);
	setTimeout(() => clearInterval(iv), 10000);
	document.addEventListener("DOMContentLoaded", sweep);
}

// Poll until the hero has actually painted (marketing sites often show a white
// load curtain for a few seconds; a near-white frame compresses tiny).
async function waitForPaint(page, { timeout = 9000 } = {}) {
	const t0 = Date.now();
	while (Date.now() - t0 < timeout) {
		const size = (await page.screenshot({ type: "jpeg", quality: 30 })).length;
		if (size > 30000) return;
		await page.waitForTimeout(200);
	}
}

const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const pad = (n) => String(n).padStart(5, "0") + ".jpg";

// --- deterministic frame capture for one device --------------------------
async function captureFrames(browser, site, opts) {
	const { name, viewport, dsf, fps, scrollSeconds, holdTop, holdBottom, mobile } = opts;
	const rawDir = join(ROOT, "public", "work", slug, "_raw", name);
	const framesDir = join(rawDir, "frames");
	rmSync(rawDir, { recursive: true, force: true });
	mkdirSync(framesDir, { recursive: true });

	const context = await browser.newContext({
		viewport,
		deviceScaleFactor: dsf,
		isMobile: mobile,
		hasTouch: mobile,
		userAgent: mobile ? devices["iPhone 13"].userAgent : undefined,
	});
	await context.addInitScript(consentHideScript, [...HIDE_CONSENT, ...(site.hideConsent || [])]);

	const page = await context.newPage();
	await page.goto(site.url, { waitUntil: "domcontentloaded", timeout: 60000 });
	await waitForPaint(page);

	// Belt-and-suspenders consent click for anything the hide missed.
	for (const label of site.consent || []) {
		try {
			await page.getByRole("button", { name: label }).or(page.getByText(label, { exact: true })).first().click({ timeout: 1500 });
		} catch {}
	}
	await page.waitForTimeout(600);

	// Pre-pass: scroll through once to force lazy-loaded images/media and fire
	// any one-shot scroll reveals, then return to top so the capture pass shows
	// fully-loaded, settled content.
	const maxY = await page.evaluate(async () => {
		const h = () => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
		for (let y = 0; y <= h(); y += window.innerHeight * 0.8) {
			window.scrollTo(0, y);
			await new Promise((r) => setTimeout(r, 80));
		}
		window.scrollTo(0, 0);
		return h();
	});
	await page.waitForTimeout(900);

	// Poster — clean, painted hero at the top.
	const posterPng = join(rawDir, "poster.png");
	await page.evaluate(() => window.scrollTo(0, 0));
	await page.screenshot({ path: posterPng });

	// Force a layout/paint settle for the frame at the current scroll position.
	const paint = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

	const Ntop = Math.round(fps * holdTop);
	const Nbottom = Math.round(fps * holdBottom);
	const Nscroll = Math.round(fps * scrollSeconds);

	// Scroll frames occupy indices [Ntop .. Ntop+Nscroll-1]; the top hold is
	// copied into [0 .. Ntop-1] afterwards so the sequence stays contiguous.
	let idx = Ntop;
	for (let k = 0; k < Nscroll; k++) {
		const p = Nscroll === 1 ? 0 : k / (Nscroll - 1);
		const y = Math.round(maxY * easeInOutSine(p));
		await page.evaluate((yy) => window.scrollTo(0, yy), y);
		await paint();
		await page.screenshot({ path: join(framesDir, pad(idx)), type: "jpeg", quality: 92 });
		idx++;
	}
	await context.close();

	// Pad the held frames (cheap file copies, no re-screenshot).
	for (let k = 0; k < Ntop; k++) copyFileSync(join(framesDir, pad(Ntop)), join(framesDir, pad(k)));
	const last = idx - 1;
	for (let k = 0; k < Nbottom; k++) copyFileSync(join(framesDir, pad(last)), join(framesDir, pad(idx++)));

	return { framesDir, poster: posterPng, frames: idx };
}

// --- ffmpeg encode -------------------------------------------------------
function encodeFrames({ framesDir, poster, fps, scale, posterScale }, outBase) {
	const ff = (args) => execFileSync("ffmpeg", ["-y", ...args], { stdio: "pipe" });
	const input = ["-framerate", String(fps), "-i", join(framesDir, "%05d.jpg")];
	const vf = `scale=${scale}:flags=lanczos`;
	// web-optimised vp9 webm (primary)
	ff([...input, "-an", "-vf", vf, "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0", "-row-mt", "1", "-pix_fmt", "yuv420p", `${outBase}.webm`]);
	// h264 mp4 fallback (Safari / older)
	ff([...input, "-an", "-vf", vf, "-c:v", "libx264", "-crf", "24", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", `${outBase}.mp4`]);
	// poster → webp
	ff(["-i", poster, "-vf", `scale=${posterScale}:flags=lanczos`, "-frames:v", "1", `${outBase}-poster.webp`]);
}

// --- main ----------------------------------------------------------------
const slug = process.argv[2] || "buildops";
const site = SITES[slug];
if (!site) {
	console.error(`No config for "${slug}". Known: ${Object.keys(SITES).join(", ")}`);
	process.exit(1);
}

const outDir = join(ROOT, "public", "work", slug);
mkdirSync(outDir, { recursive: true });

const FPS = 60;
const browser = await chromium.launch();
try {
	// Desktop only for now (test). Render 1440 layout at 2× → supersample to 1920.
	console.log(`[${slug}] capturing desktop frames @ ${FPS}fps…`);
	const cap = await captureFrames(browser, site, {
		name: "desktop",
		viewport: { width: 1440, height: 900 },
		dsf: 2,
		fps: FPS,
		scrollSeconds: 15,
		holdTop: 0.5,
		holdBottom: 0.8,
		mobile: false,
	});
	console.log(`[${slug}] encoding ${cap.frames} frames…`);
	encodeFrames(
		{ framesDir: cap.framesDir, poster: cap.poster, fps: FPS, scale: "1920:-2", posterScale: "1440:-2" },
		join(outDir, "scroll-desktop"),
	);
} finally {
	await browser.close();
	const rawRoot = join(outDir, "_raw");
	if (existsSync(rawRoot)) rmSync(rawRoot, { recursive: true, force: true });
}
console.log(`[${slug}] done → public/work/${slug}/`);
