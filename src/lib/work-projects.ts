/*
 * Work-section project data. Shape mirrors the eventual Sanity PROJECTS_QUERY
 * (title/slug/client/year/role/cover) so swapping to the CMS later is a drop-in.
 * `video` is the autoplaying modal hero preview. `gallery` is the screenshot
 * list shown below it in the case-study modal.
 *
 * Covers are extracted from the first decoded frame of the compressed preview
 * videos, so the grid thumbnail matches the modal poster before playback starts.
 * They're faithful brand stand-ins — v1 of the hybrid plan — built to be
 * swapped for real screenshots later without touching the layout, since each is
 * a single 16:9 image (keeps the GSAP Flip cover→modal-hero flight clean).
 */

export interface WorkProject {
	id: string;
	title: string;
	slug: string;
	client: string;
	category: string;
	role: string;
	year: number;
	cover: string;
	video: string;
	videoHigh: string;
	gallery: string[];
	description: string;
	summary: string;
	liveUrl: string;
}

// Cloudflare Pages has a 25 MiB limit per deployed asset. Keep preview videos
// below that limit and bump this value whenever replacing media bytes.
const ASSET_VERSION = "20260704-video-previews-1080p-cf-safe";
const asset = (path: string) => `${path}?v=${ASSET_VERSION}`;

export const WORK_PROJECTS: WorkProject[] = [
	{
		id: "verifone",
		title: "Verifone",
		slug: "verifone",
		client: "Verifone",
		category: "Payments / Web",
		role: "Webflow Development",
		year: 2025,
		cover: asset("/work/verifone/cover.webp"),
		video: asset("/work/verifone/demo-1080p.mp4"),
		videoHigh: asset("/work/verifone/demo-1080p.mp4"),
		gallery: [
			asset("/work/verifone/shot-1.webp"),
			asset("/work/verifone/shot-2.webp"),
			asset("/work/verifone/shot-3.webp"),
		],
		description:
			"I came on as the lead Webflow developer for Verifone's move off Drupal, and the brief was scale from day one: over 1,000 pages across 31 locales, with a content team that needed to ship in any market without waiting on engineering. I rebuilt everything component-first with Lumos so every page draws from one shared library, which keeps that many pages consistent and quick to update. CMS-driven navigation and custom JavaScript handle the logic Webflow can't do natively, so launching a new locale or reworking the nav is content work, not a code change.",
		liveUrl: "https://www.verifone.com/",
		summary: "A component-first rebuild for 1,000+ pages across 31 locales.",
	},
	{
		id: "buildops",
		title: "BuildOps",
		slug: "buildops",
		client: "BuildOps",
		category: "SaaS / Web",
		role: "Webflow Development",
		year: 2026,
		cover: asset("/work/buildops/cover.webp"),
		video: asset("/work/buildops/demo-1080p.mp4"),
		videoHigh: asset("/work/buildops/demo-1080p.mp4"),
		gallery: [
			asset("/work/buildops/shot-2.webp"),
			asset("/work/buildops/shot-3.webp"),
		],
		description:
			"BuildOps is an AI-native platform for commercial contractors that needed a marketing site able to move as fast as the product, so I built it component-first around 60+ reusable components the team can assemble into new pages on their own. The harder work lived under the surface: custom JavaScript drives the filtering, and I built a copy-paste HTML library inside rich text so the client can drop in complex blocks without touching code. I also migrated more than 1,000 blog posts into the new structure, so nothing was lost in the move.",
		liveUrl: "https://buildops.com/",
		summary: "A scalable Webflow system built around 60+ reusable components.",
	},
	{
		id: "gainbridge",
		title: "Gainbridge",
		slug: "gainbridge",
		client: "Gainbridge",
		category: "Fintech / Web",
		role: "Webflow Development",
		year: 2026,
		cover: asset("/work/gainbridge/cover.webp"),
		video: asset("/work/gainbridge/demo-1080p.mp4"),
		videoHigh: asset("/work/gainbridge/demo-1080p.mp4"),
		gallery: [
			asset("/work/gainbridge/shot-1.webp"),
			asset("/work/gainbridge/shot-2.webp"),
			asset("/work/gainbridge/shot-3.webp"),
		],
		description:
			"Gainbridge took a sharp turn mid-build: a brand-new design system landed from another agency and I had to pivot the whole fintech site onto it without losing momentum, which is exactly what a component-first architecture makes survivable. Annuities are a famously opaque product, so the real goal was keeping the site easy to run day to day. Custom JavaScript carries the complexity behind the scenes and leaves the client with an editor that stays genuinely simple, even though the product underneath is anything but.",
		liveUrl: "https://gainbridge.com/",
		summary: "A flexible fintech build that absorbed a new design system mid-flight.",
	},
	{
		id: "sharp-performance",
		title: "Sharp Performance",
		slug: "sharp-performance",
		client: "Sharp Performance",
		category: "Brand / Web",
		role: "Design + Development",
		year: 2025,
		cover: asset("/work/sharp-performance/cover.webp"),
		video: asset("/work/sharp-performance/demo-1080p.mp4"),
		videoHigh: asset("/work/sharp-performance/demo-1080p.mp4"),
		gallery: [
			asset("/work/sharp-performance/shot-1.webp"),
			asset("/work/sharp-performance/shot-2.webp"),
			asset("/work/sharp-performance/shot-3.webp"),
		],
		description:
			"Sharp Performance was a design-and-build project where motion was the whole point. The site runs on full-screen section interactions built with fullPage.js and custom JavaScript, so each section is its own choreographed moment rather than a flat scroll. I designed and built it end to end, hand-tuning every transition and reveal so the motion feels intentional instead of decorative, which makes it the project where the craft is most visible.",
		liveUrl: "https://www.sharpperformance.com/",
		summary: "An immersive design-and-build shaped around full-screen motion.",
	},
];

// Lookup by slug — used by the /work/[slug] case-study route (getStaticPaths
// + the page itself). Returns undefined for unknown slugs.
export function getProjectBySlug(slug: string): WorkProject | undefined {
	return WORK_PROJECTS.find((p) => p.slug === slug);
}
