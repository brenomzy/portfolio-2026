/*
 * Mock project data for the Work section — placeholder until real projects
 * land in Sanity (then swap to PROJECTS_QUERY; the shape mirrors it on
 * purpose: title/slug/client/year/role/cover). `gallery` is the screenshot
 * list shown in the case-study modal. Covers are on-brand gradient
 * placeholders in public/placeholders/, replaced by real screenshots later.
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
	gallery: string[];
	description: string;
	liveUrl: string;
}

export const WORK_PROJECTS: WorkProject[] = [
	{
		id: "aurora",
		title: "Aurora — Brand & Website",
		slug: "aurora",
		client: "Aurora Labs",
		category: "Brand / Web",
		role: "Design + Development",
		year: 2026,
		cover: "/placeholders/p1.svg",
		gallery: ["/placeholders/p4.svg", "/placeholders/p3.svg", "/placeholders/p5.svg"],
		description:
			"Led the design and build of Aurora's marketing site — a conversion-focused system with consistent visuals across web and campaign touchpoints.",
		liveUrl: "#",
	},
	{
		id: "trace",
		title: "Trace — SaaS Marketing Site",
		slug: "trace",
		client: "Trace",
		category: "SaaS",
		role: "Webflow Development",
		year: 2025,
		cover: "/placeholders/p2.svg",
		gallery: ["/placeholders/p6.svg", "/placeholders/p1.svg", "/placeholders/p3.svg"],
		description:
			"Built a component-first Webflow site for a developer-tools startup: CMS-driven changelog, docs hub, and a design system the team ships with daily.",
		liveUrl: "#",
	},
	{
		id: "mono",
		title: "Mono Studio — Portfolio",
		slug: "mono-studio",
		client: "Mono Studio",
		category: "Portfolio",
		role: "Design + Development",
		year: 2025,
		cover: "/placeholders/p3.svg",
		gallery: ["/placeholders/p5.svg", "/placeholders/p2.svg", "/placeholders/p4.svg"],
		description:
			"A restrained, type-led portfolio for a photography duo — fast, accessible, and built to put the work first.",
		liveUrl: "#",
	},
	{
		id: "kiln",
		title: "Kiln — E-commerce",
		slug: "kiln",
		client: "Kiln Ceramics",
		category: "E-commerce",
		role: "Development",
		year: 2024,
		cover: "/placeholders/p4.svg",
		gallery: ["/placeholders/p1.svg", "/placeholders/p6.svg", "/placeholders/p2.svg"],
		description:
			"Storefront for a small-batch ceramics studio: editorial product pages, a warm visual language, and checkout tuned for mobile.",
		liveUrl: "#",
	},
	{
		id: "field-notes",
		title: "Field Notes — Editorial",
		slug: "field-notes",
		client: "Field Notes",
		category: "Editorial",
		role: "Design + Development",
		year: 2024,
		cover: "/placeholders/p5.svg",
		gallery: ["/placeholders/p3.svg", "/placeholders/p4.svg", "/placeholders/p1.svg"],
		description:
			"An editorial platform with a strong reading experience — fluid type scale, considered rhythm, and CMS workflows the writers actually enjoy.",
		liveUrl: "#",
	},
	{
		id: "vetro",
		title: "Vetro — Product Launch",
		slug: "vetro",
		client: "Vetro",
		category: "Launch Site",
		role: "Development",
		year: 2023,
		cover: "/placeholders/p6.svg",
		gallery: ["/placeholders/p2.svg", "/placeholders/p5.svg", "/placeholders/p1.svg"],
		description:
			"High-impact launch site with scroll-driven storytelling — built in a two-week sprint without sacrificing polish or performance.",
		liveUrl: "#",
	},
];
