// Site-wide constants — the single source of truth for site metadata now that
// the CMS is gone. Edit here; index/footer/layout read from these.

// Brand / wordmark name (footer SVG, OG site_name).
export const SITE_NAME = "Breno";

// Home <title> and meta description.
export const SITE_TITLE = "Breno — Designer & Developer";
export const SITE_DESCRIPTION =
	"Portfolio of Breno — a developer from Brazil turning design into fast, accessible, hand-built websites.";

// Contact email — hardcoded. All contact / "Get in touch" CTAs copy this to the
// clipboard (with a toast) rather than opening a mail client; the mailto: href
// is kept only as a no-JS fallback.
export const CONTACT_EMAIL = "contato@brenodaroz.com";
