import type { APIRoute } from "astro";
import { WORK_PROJECTS } from "../lib/work-projects";

const STATIC_PATHS = ["/", "/about/"];

export const GET: APIRoute = ({ site }) => {
	const baseUrl = site ?? new URL("https://breno.work");
	const paths = [
		...STATIC_PATHS,
		...WORK_PROJECTS.map((project) => `/work/${project.slug}/`),
	];
	const urls = paths
		.map((path) => `\t<url><loc>${new URL(path, baseUrl).href}</loc></url>`)
		.join("\n");

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
			`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
			`${urls}\n` +
			`</urlset>\n`,
		{
			headers: {
				"Content-Type": "application/xml; charset=utf-8",
			},
		},
	);
};
