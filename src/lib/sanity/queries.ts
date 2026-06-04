import { defineQuery } from "groq";

/**
 * GROQ queries. Wrapped in defineQuery() so `sanity typegen` can read them and
 * generate result types into sanity.types.ts (set up once the Studio schema exists).
 */

// All projects for the work index — featured first, then newest.
export const PROJECTS_QUERY = defineQuery(`
	*[_type == "project" && !(_id in path("drafts.**"))]
	| order(featured desc, year desc) {
		_id,
		title,
		"slug": slug.current,
		client,
		year,
		role,
		tags,
		cover,
		featured
	}
`);

// A single project case study by slug.
export const PROJECT_BY_SLUG_QUERY = defineQuery(`
	*[_type == "project" && slug.current == $slug][0] {
		_id,
		title,
		"slug": slug.current,
		client,
		year,
		role,
		tags,
		cover,
		gallery,
		body,
		links
	}
`);

// Slugs only — for getStaticPaths.
export const PROJECT_SLUGS_QUERY = defineQuery(`
	*[_type == "project" && defined(slug.current)].slug.current
`);

// About singleton.
export const ABOUT_QUERY = defineQuery(`
	*[_type == "about"][0] {
		bio,
		photo,
		skills
	}
`);

// Global site settings singleton.
export const SITE_SETTINGS_QUERY = defineQuery(`
	*[_type == "siteSettings"][0] {
		title,
		description,
		nav,
		socials,
		email
	}
`);
