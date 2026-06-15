# Portfolio — Next Steps

A prioritized backlog from a portfolio audit (current site vs. what strong dev/designer
portfolios do). Grouped by impact. Each item notes **why**, **where**, and rough **effort**.

**How to trigger next session:** point at an item, e.g. _"let's do P1-1 (case studies)"_
or _"knock out the P3 quick wins."_ Items are roughly independent.

---

## Where it stands today (the strong parts — keep these)

- Hero, Selected Work grid, "More work" marquee, condensed About → strong homepage spine.
- Deep `/about` page: background story, values, experience timeline, tool stack, jams, the
  2004 relic. Genuinely rich and personal.
- Polished motion system (GSAP, container-first reveals, cross-fade transitions), theme
  toggle, reduced-motion paths, skip link. Craft is clearly there.
- Case-study deep links via modal (`/work/<slug>`), local content model.

## The core gap in one line

The site **looks** like a senior portfolio but doesn't yet **prove** outcomes. Hiring
managers and clients look for: framed problem → your role → process → measurable result,
plus social proof and an easy way to contact you. That's where the priorities below focus.

---

## P1 — High impact (do these first)

### P1-1 · Turn case studies into real case studies
**Now:** each `/work/<slug>` is one paragraph + 3 gallery shots + meta rows.
**Target:** structured narrative per project — Context/Challenge → My role → What I built
(key decisions, the hard parts) → Outcome (metrics where possible) → Stack.
**Why:** the single biggest differentiator in the research — "frame the problem, your role,
and what changed because of your work," backed by metrics/testimonials. ~90% of hiring
managers expect a strong portfolio; thin project blurbs are the most common miss.
**Where:** extend the `WorkProject` shape in `src/lib/work-projects.ts` (add `challenge`,
`role`/`contribution` bullets, `outcome`/`metrics`, `stack[]`); render in
`src/components/ProjectModal.astro` (or promote to full `/work/<slug>` pages if the content
outgrows the modal). Get real numbers from you per project (load time, conversion, # pages,
locales, time saved for the client).
**Effort:** M–L (content-gathering is the real cost).

### P1-2 · A closing Contact section + a functional footer
**Now:** the footer is a decorative oversized wordmark only — no email, socials, or nav.
Contact lives only in the hero buttons + the About page.
**Target:** a dedicated "Let's work together" CTA section before the footer (email copy +
availability + socials), and a real footer (email, LinkedIn/X/GitHub, nav links, copyright,
"built with" credit, back-to-top).
**Why:** every strong portfolio closes with a clear contact moment; the research lists a
contact/CTA section as essential. Right now a scroll-to-bottom visitor hits a dead end.
**Where:** new `src/components/ContactSection.astro` + expand `src/components/SiteFooter.astro`
(keep the wordmark as the backdrop). Wire to existing `[data-copy-email]` toast.
**Effort:** M.

### P1-3 · Social proof / testimonials
**Now:** none anywhere.
**Target:** 2–4 short quotes (BX Studio, Finsweet, a client/PM) with name + role, ideally
a logo strip of companies worked with (Verifone, BuildOps, Gainbridge, Finsweet, BX Studio).
**Why:** testimonials + recognizable logos are repeatedly cited as the trust signal that
"reassures cold prospects." Finsweet especially carries weight in the Webflow world.
**Where:** new `src/components/Testimonials.astro` (+ data in a new `src/lib/testimonials.ts`);
optional `LogoStrip` near the top of Selected Work. Needs real quotes from you.
**Effort:** S–M.

### P1-4 · Sharing + SEO meta polish
**Now:** `Base.astro` declares `twitter:card=summary_large_image` but there is **no
`og:image`/`twitter:image`** → links shared anywhere preview blank. Title/description copy
still says "Designer & Developer" (pre the "Design Engineer · Webflow Developer" reposition).
**Target:** add a default OG image (+ ideally per-page), sync `SITE_TITLE`/`SITE_DESCRIPTION`
in `src/lib/site.ts` and the `Base.astro` default to the new positioning, add Person JSON-LD,
add a sitemap (`@astrojs/sitemap`) and `robots.txt`, and confirm `site` is set in
`astro.config` so canonical/OG URLs are absolute.
**Why:** the portfolio gets shared in DMs/Slack/LinkedIn; a blank preview undercuts all the
craft. Cheap, high-leverage.
**Where:** `src/layouts/Base.astro`, `src/lib/site.ts`, `astro.config.*`, `public/`.
**Effort:** S (plus designing one OG image).

---

## P2 — Medium impact

### P2-1 · Header navigation
**Now:** header is logo + theme toggle only — no way to jump to Work / About / Contact.
**Target:** a small nav (Work · About · Contact, maybe Résumé). On the single-page home,
anchor links; real links elsewhere. Mobile: a minimal menu.
**Where:** `src/components/SiteHeader.astro`. **Effort:** S–M.

### P2-2 · Availability indicator
**Now:** the hero dropped the "open to freelance" line; no availability signal anywhere.
**Target:** a tasteful status pill ("Available for freelance" / "Booking <month>") in the
header or hero. Single source of truth in `site.ts` so it's a one-line toggle.
**Where:** `src/lib/site.ts` + header/hero. **Effort:** S.

### P2-3 · Quantify outcomes on cards
**Target:** surface 1–2 hard numbers on each Selected Work card or its hover state (e.g.
"1,000+ pages · 31 locales"). Pulls the P1-1 metrics forward for skimmers.
**Where:** `src/lib/work-projects.ts` + `src/components/WorkSection.astro`. **Effort:** S.

### P2-4 · 404 page
**Now:** none. **Target:** branded `src/pages/404.astro` (wordmark + "back home").
**Effort:** S.

---

## P3 — Quick wins / polish (batch in one pass)

- **Résumé visibility:** PDF exists on `/about`; surface it in the header/footer too.
- **Privacy-friendly analytics:** Cloudflare Web Analytics or Plausible — measure what works.
- **`og:image` per case study:** reuse each project's cover (depends on P1-4).
- **Real X/Twitter handle:** `src/lib/about.ts` still has a placeholder `https://x.com/`.
- **GitHub link:** add to socials if you want to show code.

## P4 — Optional / bigger bets

- **Writing/notes section:** even 2–3 short posts ("how I built the cross-fade", "Webflow at
  enterprise scale") signal depth — common on design-engineer sites. New `/notes` + content
  collection.
- **Services / "how I work" section:** if freelance is a real goal, a short process + what
  you offer helps clients self-qualify.
- **Dedicated `/work` index:** if the project list grows beyond the homepage grid.

---

### Suggested order
P1-4 (cheap, high-leverage) → P1-2 (contact/footer) → P1-3 (testimonials) → P1-1 (case
studies, the big one) → P2 batch → P3 quick-wins pass.

_Sources behind this audit: portfolio structure + case-study research (Figma resource
library, UX hiring reports, icreatives hiring-manager process, Hostinger/Wix roundups), and
hero-copy patterns from Brittany Chiang, Lee Robinson, Paco Coursey, Adham Dannaway._
