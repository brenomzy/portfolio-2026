/*
 * About content — single source of truth for the homepage About section
 * (condensed) and the full /about page. Mirrors the lib/work-projects.ts +
 * lib/site.ts pattern: typed constants, edited here, read by the components.
 *
 * Copy is real (Breno's voice, light on em dashes). Still TODO before launch:
 *   - photos/portrait  → the /about photo strip is deferred (Osmo component
 *     coming later); the home section still uses a placeholder portrait.
 *   - socials.x        → real X/Twitter handle (placeholder URL for now)
 *   - jams[].trackId   → real Spotify track IDs (see note on the type)
 */

import { CONTACT_EMAIL } from "./site";

export interface AboutValue {
	/** Display index, e.g. "01". */
	no: string;
	title: string;
	body: string;
}

export interface ExperienceItem {
	/** Free-form period label, e.g. "2025 – Now". */
	period: string;
	role: string;
	org: string;
	/** Optional company link. */
	url?: string;
	/** Optional location / arrangement, e.g. "New York · Remote". */
	note?: string;
}

export interface Tool {
	name: string;
	/** Filename in /public/tools — a single-path brand SVG, used as a mask. */
	icon: string;
	/** Brand colour for the app-icon tile background. */
	color: string;
	/** Use a dark glyph instead of white (for light-coloured tiles, e.g. JS). */
	darkGlyph?: boolean;
}

export interface Jam {
	/** Shown as the accessible label / no-JS fallback link text. */
	title: string;
	artist: string;
	/**
	 * Spotify TRACK id — the part after /track/ in a track URL
	 * (open.spotify.com/track/<THIS>). Used to build the official embed iframe.
	 * TODO: replace the placeholders with your own tracks.
	 */
	trackId: string;
}

export interface Social {
	label: string;
	href: string;
	/** Which inline icon to render (handled in about.astro). */
	icon: "linkedin" | "x";
}

export const ABOUT = {
	/* ---- Homepage section (condensed) ------------------------------------ */
	home: {
		heading: "About",
		/* One step deeper than the hero: approach, not the same intro line. */
		lead: "I work where design meets front-end. I like owning a site end to end, from the first layout idea to the last line of CSS.",
		body: "Mostly self-taught, a little obsessed with detail, and happiest when the motion feels right and the page still loads fast. Right now I'm building at BX Studio.",
	},

	/* ---- Full /about page ------------------------------------------------- */

	/* Opening: a smaller title + a short paragraph (split per design). */
	introTitle: "I'm Breno, a developer and designer from Brazil.",
	introBody:
		"I build fast, hand-made websites, and I still sweat the small details the way I did as a kid.",

	/* Small line under the intro that anchors the years. */
	tenure: "On the web since 2002 · 7+ years doing it professionally",

	resumeUrl: "/breno-daroz-resume.pdf",

	socials: [
		{ label: "LinkedIn", href: "https://www.linkedin.com/in/breno-daroz", icon: "linkedin" },
		// TODO: real X/Twitter handle.
		{ label: "X", href: "https://x.com/", icon: "x" },
	] as Social[],

	// Home section still uses this; the /about photo strip is deferred (Osmo).
	portrait: { src: "/about/portrait.svg", alt: "Portrait of Breno" },

	/* "My background" / story. */
	background: [
		"It started in 2002 with a Pokémon fan site. I was a kid who just wanted a page on the internet, so I taught myself enough HTML to put one together. It was rough, but it was mine, and that was it. I was hooked.",
		"Photoshop pulled me in next. I spent years on design forums back then, posting work, soaking up critique, slowly figuring out what made something look good and why. That habit of jumping between building and designing never really left me.",
		"Since then I've worked as a front-end developer and a UX/UI designer, and for the last few years I've gone deep on Webflow and custom code. Today I build marketing and product sites at BX Studio, still doing both sides of it: the design and the code.",
	],

	/* "Approach / values" — numbered. */
	values: [
		{
			no: "01",
			title: "Motion that earns its place",
			body: "Animation should help you understand the page, not just show off. If a transition isn't adding anything, I cut it.",
		},
		{
			no: "02",
			title: "Layouts that survive real content",
			body: "A design only counts once it holds up with long names, missing images, and the messy copy that actually ships. Not just the tidy mockup version.",
		},
		{
			no: "03",
			title: "Fast by default",
			body: "Performance is a feature. I keep things lean and accessible from the start, because that's a lot easier than trying to bolt it on later.",
		},
	] as AboutValue[],

	/* "Now" block. */
	now: {
		label: "Currently",
		body: "Building marketing and product sites at BX Studio, and open to a few select freelance projects.",
	},

	/* App-icon tiles (Radilson-style). darkGlyph for light brand colours. */
	tools: [
		{ name: "Webflow", icon: "webflow.svg", color: "#146EF5" },
		{ name: "JavaScript", icon: "javascript.svg", color: "#F7DF1E", darkGlyph: true },
		{ name: "GSAP", icon: "gsap.svg", color: "#0AE448", darkGlyph: true },
		{ name: "HTML", icon: "html5.svg", color: "#E34F26" },
		{ name: "CSS", icon: "css.svg", color: "#1572B6" },
		{ name: "Figma", icon: "figma.svg", color: "#F24E1E" },
		{ name: "Photoshop", icon: "adobephotoshop.svg", color: "#001E36" },
		{ name: "Astro", icon: "astro.svg", color: "#7611A6" },
		{ name: "Tailwind", icon: "tailwindcss.svg", color: "#06B6D4" },
		{ name: "TypeScript", icon: "typescript.svg", color: "#3178C6" },
		{ name: "Git", icon: "git.svg", color: "#F05032" },
	] as Tool[],

	/* Spotify embeds — Breno's picks. */
	jams: [
		{ title: "Every Time I Look for You", artist: "Blink-182", trackId: "0V7Wn8Fry7KBO5stYqpFvM" },
		{ title: "1, 2 Many", artist: "Luke Combs, Brooks & Dunn", trackId: "226le7T3p82reYWzsi9Hsz" },
		{ title: "Popular Girl", artist: "Survivor", trackId: "1XBy3DbiK3EnjZGL1fJpe8" },
	] as Jam[],

	/* Real history, from the résumé. */
	experience: [
		{ period: "2025 – Now", role: "Senior Webflow Developer", org: "BX Studio", note: "New York · Remote" },
		{ period: "2023 – 2025", role: "Webflow Developer", org: "Finsweet", note: "Remote" },
		{ period: "2022 – 2023", role: "Senior UX/UI Designer", org: "Promob", note: "Caxias do Sul · Remote" },
		{ period: "2020 – 2022", role: "UX/UI Designer", org: "Thes Sistemas Eclesiais", note: "Maringá, BR" },
	] as ExperienceItem[],

	contact: {
		email: CONTACT_EMAIL,
		blurb: "Got a project in mind, or just want to say hi? Email is the quickest way to reach me.",
	},
};
