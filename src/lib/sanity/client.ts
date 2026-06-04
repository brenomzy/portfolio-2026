// Single import surface for the Sanity client (configured by @sanity/astro in
// astro.config.mjs). Use in .astro frontmatter:
//   import { sanityClient } from "../lib/sanity/client";
//   import { PROJECTS_QUERY } from "../lib/sanity/queries";
//   const projects = await sanityClient.fetch(PROJECTS_QUERY);
export { sanityClient } from "sanity:client";
