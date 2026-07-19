// Site-wide constants — the single source of truth for site metadata now that
// the CMS is gone. Edit here; index/footer/layout read from these.

// Brand / wordmark name (footer SVG, OG site_name).
export const SITE_NAME = "Breno";

// Home <title> and meta description.
export const SITE_TITLE = "Breno Daroz — Webflow Developer & Designer";
export const SITE_DESCRIPTION =
	"Design engineer and Webflow developer from Brazil, building fast, accessible, component-first websites for companies like Verifone, BuildOps and Gainbridge.";

// Contact email — hardcoded. All contact / "Get in touch" CTAs copy this to the
// clipboard (with a toast) rather than opening a mail client; the mailto: href
// is kept only as a no-JS fallback.
// hey@ is a Google Workspace alias that delivers to the real contato@ inbox —
// nicer on an English-language site; mail still lands in the same place.
export const CONTACT_EMAIL = "hey@brenodaroz.com";
