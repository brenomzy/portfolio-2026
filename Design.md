# Design System — Portfolio

Living record of the design decisions behind this site: *what* we chose and,
more importantly, *why*. The source of truth for values is
[`src/styles/tokens.css`](src/styles/tokens.css); this file explains the intent.

---

## Foundations

### Color

Theme-aware tokens (light + dark) live in `tokens.css` under `:root` and
`[data-theme="dark"]`, exposed to Tailwind via `@theme inline` so every utility
reacts to the active theme.

| Token | Role | Light | Dark |
| --- | --- | --- | --- |
| `--bg` | Page background | warm cream | near-black warm grey |
| `--surface` / `--surface-raised` | Cards, raised panels | — | — |
| `--text` / `--text-muted` | Body / secondary text | warm ink | warm off-white |
| `--border` | Hairlines | — | — |
| `--accent` | Brand orange `#FF4E2A` | `hsl(10 100% 58%)` | lifted to `62%` |
| `--accent-ink` | Accent for small text/icons (AA) | mirrors accent | lifted to `66%` |
| `--accent-contrast` | Ink that sits **on** orange | near-black | near-black |

**Why two accent tokens.** Orange at brand strength fails AA as text on light
surfaces. `--accent` is for fills/large shapes; `--accent-ink` is the
contrast-safe variant for small text and icons. In dark mode both lift so the
orange stays vibrant on grey.

**Accent is a spice, not a base.** Used for a few deliberate moments (CTAs, the
button hover flood), never body text or large fields.

### Type

**Geist Sans** everywhere. Fluid scale `--text-step--1 … 6` via `clamp()`
(320 → 1240px). **Archivo Black** is loaded as a display face for the footer
wordmark only.

> **Geist Mono dropped.** `--font-mono` now resolves to a *system* mono stack;
> the Geist Mono webfont import was removed since nothing uses it (the footer meta
> and the copy toast were the last holdouts — both moved to sans). Re-add the
> `@fontsource-variable/geist-mono` import if a real mono need returns.

### Space

Fluid scale `--spacing-3xs … 3xl`, also `clamp()`-based. Used both as Tailwind
utilities (`p-m`, `gap-l`) and raw vars in scoped component CSS.

### Radius

`--radius-sm … xl` exist for cards/media. **Buttons are intentionally squared
(radius 0)** for now — see below.

### Elevation — layered shadows

`--shadow-1 … --shadow-5` (`tokens.css`). Each level **stacks several shadow
layers** with growing blur/offset and falling opacity, so the penumbra falls off
like real soft light — a single `box-shadow` reads flat/cheap by comparison.
Colour + strength are theme vars so shadows warm-tint on the cream UI and gain
punch on dark:

- `--shadow-hsl` — `24 24% 10%` (warm near-black) light · `0 0% 0%` dark
- `--shadow-strength` — added to every layer's alpha · `0` light · `0.06` dark

Reach for the lowest level that reads: **1** hairline · **2** resting card ·
**3** hover · **4** floating (menus/sticky) · **5** overlay (modals, the page
panel over the footer). Use as `box-shadow: var(--shadow-3);`.

> Drop shadows barely register on dark surfaces by nature — on dark, depth leans
> on tonal contrast more than the shadow. Known + accepted.

### Motion

**Default ease — `--ease-default: cubic-bezier(0.7, 0, 0.3, 1)`.** A smooth,
symmetric ease-in-out with **no overshoot**. This is the project default: reach
for it first for transitions and state changes (theme toggle, hovers, reveals).
Other easings exist for specific intent: `--ease-out-expo` (entrances),
`--ease-in-out-quart`, `--ease-spring` (reserved — see the tone note below).

**Tone: smooth, not springy.** The brand reads serious / premium, so we avoid
bouncy overshoot eases. `--ease-default` and the button's own
`cubic-bezier(0.32, 0.72, 0, 1)` are both decisive with no rebound. We dropped the
original Osmo `linear()` spring — it felt playful, wrong for the voice. (When a
reference ships a springy ease — e.g. an overshoot `…1.5…` — swap it for
`--ease-default` to stay on-voice.)

### Entrance animations (GSAP + SplitText)

**Library: GSAP** (added as a dependency; `SplitText` is bundled-in and free as of
3.13). Used for JS-driven entrances where CSS can't easily reach — per-line text
reveals, sequenced timelines.

**Header reveal** (script in [`SiteHeader.astro`](src/components/SiteHeader.astro)).
On load the logo, then the theme toggle **blur-in**: `gsap.from`
with `autoAlpha: 0`, `filter: blur(8px)`, a small `y`, staggered on `expo.out`. The
blur (rather than a plain fade) echoes the entrance feel from the aritro.xyz
reference. Runs immediately (no text to split, so no font wait), so the header
settles a beat before the hero — a natural top-down order. `filter` is cleared
(`clearProps`) on complete so nothing lingers.

**Hero reveal** (script in [`index.astro`](src/pages/index.astro)). On load, the
hero heading and lead are `SplitText`-split into **words** that **fade in, drift up,
and sharpen from blur** (`autoAlpha` + `y` + `blur(8–10px)`), then the buttons
follow — one `gsap.timeline` sequencing title → lead → actions on **`power2.out`**
(gentler/slower than `expo.out`, which snaps then crawls). Word stagger uses
`stagger: { amount }` so the spread is a fixed time regardless of word count.
Modeled on aritro.xyz.

> **No clip/mask.** An earlier version used `mask: "lines"` (lines sliding out from
> behind a hard clip edge). Dropped it to match the reference, which has no clip —
> the soft blur-and-fade *is* the reveal. (Also evolved lines → words for a finer,
> word-by-word reveal.) The blur is shared with the header blur-in so the whole
> entrance reads as one family.

Line filters clear with `split.revert()`; the buttons `clearProps: "filter"`.

The robustness pattern (worth reusing for future reveals):

- **No FOUC, no SEO cost.** Targets carry `data-split` / `data-reveal` and are
  hidden by `html.js [data-split] { visibility: hidden }` in `global.css` — the
  `.js` class is set by the head script, so the hide applies *only* when JS can
  un-hide. No-JS visitors and crawlers see the text. The script flips visibility on
  at the same frame the masked lines are parked off-screen, so there's no flash.
- **Split after fonts settle** (`document.fonts.ready`, capped by a 1.5s race so a
  stalled font can't leave the hero hidden), so line breaks are measured correctly.
- **Revert after playing** (`onComplete`) — SplitText is undone so the text returns
  to normal, reflowable markup (resize reflows; no replay).
- **Reduced-motion** is gated in JS (skip the split, reveal instantly) — the global
  CSS reduced-motion block only neutralizes CSS animation, not GSAP's JS tweens.
- The heading overrides the global `text-wrap: balance` (→ `pretty`); balance
  interferes with SplitText line measurement.

---

## Components

Convention: BEM with a `c-` prefix (`c-button`, `c-card`), styling scoped inside
each component's `.astro` `<style>` block. JS hooks (if any) use a `js-` prefix
and are never styled. Component-local theming is done with `--btn-*`-style
custom properties so variants override values without forking CSS.

### Header — `c-header`

[`src/components/SiteHeader.astro`](src/components/SiteHeader.astro). A sticky,
pared-back bar — `display: flex; justify-content: space-between`:

- **Left** — the logo (`c-logo`), linked home.
- **Right** — the theme toggle only.

> **"Contact me" removed.** The nav `accent` CTA was cut as redundant — contact is
> covered by the hero and footer CTAs (which copy the email + toast; see
> [Contact pattern](#contact-pattern--copy--toast)). The header is now just
> logo + toggle. Re-add a Button here if a persistent nav CTA is wanted later.

**No nav links.** The earlier About / Work center links were removed — with a
short single-page portfolio the CTA + a clear hero do the wayfinding, and the
sparse reference sites (heykuba, darusim) argued for less chrome. The Sanity `nav`
array still exists in settings but is unused; re-introduce a `<nav>` here if the
link set ever grows.

**Sticky + blur.** `position: sticky` with a translucent background
(`color-mix(var(--bg) 78%, transparent)`), `backdrop-filter: blur(0.85em)
saturate(1.3)`, and a `--border` hairline underneath. The blur is **uniform**
(not progressive) but uses the same `em`-based language as the
[progressive blur](#progressive-blur--c-progressive-blur) so the two read as one
system. The saturate keeps the warm cream / orange from going flat. Both themes
get it for free since the background is mixed from `--bg`.

**Dropped from the old header.** The "Available for work" status dot and the live
São Paulo clock — cut for the same minimal reasons.

### Progressive blur — `c-progressive-blur`

[`src/components/ProgressiveBlur.astro`](src/components/ProgressiveBlur.astro),
mounted globally in `Base.astro`. A fixed, non-interactive overlay pinned to the
**bottom** of the viewport: five stacked `backdrop-filter` layers, each blurring
more (`0.094em → 1.5em`) and masked to a progressively lower band, so the blur
**ramps up toward the bottom edge** — content softly dissolves as it scrolls off.

- `isolation: isolate` + `contain: paint` + `translateZ(0)` keep it on its own
  compositing layer so it doesn't force the rest of the page to repaint.
- Blur radii are in `em` so the whole ramp scales together, and so the
  [header's uniform blur](#header--c-header) can share the same language.
- Purely decorative → `aria-hidden`, `pointer-events: none`.

> *Watch:* because it's fixed at the bottom, the footer sits under the blur when
> you reach the end of the page (intended — it's the dissolve effect). If a future
> bottom-anchored UI needs to stay crisp, raise it above `z-index: 40`.

### Logo — `c-logo`

[`src/components/Logo.astro`](src/components/Logo.astro). The brand wordmark,
inlined as SVG.

**One file, fully theme-aware.** The wordmark letters are `fill="currentColor"`,
so they follow the active theme (warm ink on light, warm white on dark). The
**mark gradient is also theme-aware** now, driven by tokens
`--logo-grad-1/2` on the `<stop>`s (and the small accent patch), so it flips with
the theme — **no light/dark file swap**.

> **Gradient matches the footer, flips orange→blue.** The mark echoes the footer's
> backlit palette: **orange in light** (`#ff8f41 → #c6400b`) and **night-blue in
> dark** (`#4f7ddc → #294e9e`) — the same hot→deep stops the footer WebGL gradient
> uses. A `0.4s` `stop-color`/`fill` transition eases the recolour on toggle.
> (Was a fixed warm-orange brand asset; made theme-aware so the mark and footer
> read as one system.)

> `aria-label` corrected `Brone → Breno` (here and on the header brand link).

Sized by CSS `height` (`1.75rem`) with `width: auto`; the `123:50` viewBox holds
the ratio.

### Theme toggle — `c-theme-toggle`

[`src/components/ThemeToggle.astro`](src/components/ThemeToggle.astro). An
**icon-only circle** (`border-radius: 50%`) that sits beside the CTA Button —
`--surface` fill, hairline border. **`3em × 3em`** so its height matches the Button
exactly (the Button is 3em tall at the same `0.75rem` font). The circle is a
deliberate counterpoint to the **squared** Buttons — a round icon button reads as a
utility control, distinct from the CTAs. Flips `[data-theme]` on `<html>`; the
no-flash init lives in `Base.astro`.

> Earlier iterations: a labeled pill ("Light mode" → "Light"/"Dark"), then an
> icon-only square, now an icon-only circle. Each step shed chrome.

**Shows the target mode** ("switch to"): **moon** in light (click → go dark),
**sun** in dark (→ go light). (Swapped from an earlier "current mode" reading —
showing where the click takes you is the more common, clearer convention.)

**Animation.** On toggle the icons run a vertical *rotate-and-slide* swap inside a
clipped (`overflow: hidden`) window — the outgoing icon exits up while the incoming
one rises from below, each rotating ±90°, on **`--ease-default`** (the project
default ease). The reference's springy `…1.5…` icon ease was deliberately *not*
used — see Foundations → Motion. A `prefers-reduced-motion` fallback keeps the swap
but drops the travel (opacity only).

**Icons.** Sun (circle + 8 rays) and moon (crescent), `stroke-width: 1.5` on
`currentColor` — crisp at this size (an earlier 1px set read faint).

**Persistence — cookie.** Preference is stored in a `theme` cookie
(`path=/; max-age=31536000; samesite=lax`) rather than `localStorage`. On a static
build both behave identically (the no-flash init reads it client-side before
paint); the cookie is a forward-looking choice so a future SSR pass could read it
server-side and render the right theme with zero client work.

**Theme wipe (clip-path via View Transitions).** The toggle wraps the
`[data-theme]` swap in `document.startViewTransition()` and tags `<html>` with
`.is-theme-vt`; document-level rules in `global.css` then clip-path the *new*
(themed) snapshot in over the old as a **diagonal upward wipe** — the same gesture
as the Button hover, but at `0.55s` on `--ease-default` so a full-page color change
reads as a soft sweep, not a flash. The wipe is scoped to `.is-theme-vt` so normal
page navigations keep Astro's default crossfade. Browsers without View Transitions,
and anyone with `prefers-reduced-motion`, skip it (JS guard) for an instant swap.

**Toggle stays visible through the wipe.** The toggle carries its own
`view-transition-name: theme-toggle`, lifting it out of the page snapshot so it
gets a *separate* transition. Key constraint learned the hard way: **the live DOM
is not painted during a view transition — only snapshots are.** So you can't show
the real CSS rotate-slide here (excluding the element just leaves a transparent
gap, not a live element). Instead the toggle's old (sun) and new (moon) snapshots
**cross-fade in place**, retimed to `0.5s` so it rides alongside the wipe rather
than popping at the end (the wipe reaches the top-right corner last). The bespoke
rotate-slide still plays on the **no-VT / reduced-motion** path, where there's no
snapshot to freeze it.

> *Also:* `:root.is-theme-vt .c-theme-toggle { transition: none }` freezes the
> toggle's own `background/border-color` transition during the wipe. Without it the
> theme swap re-fires that `0.2s` transition on the live element, animating out of
> sync with the crossfade snapshot — which made the **hover border flash/pop** as
> the snapshot lifted. Hover transitions resume normally once the wipe ends.

### Buttons — `c-button`

[`src/components/Button.astro`](src/components/Button.astro). Adapted from Osmo
Supply "button-023". Renders an `<a>` when given `href`, else a `<button>`.

**Anatomy.** A single centered label sits above a two-panel background. On hover
the panels wipe up diagonally and the label color crosses over with them. One
label element — *not* two (the original swapped a duplicate in/out). A static
label that the fill passes under reads more premium and restrained than a
swap-and-rotate; it also matches the small all-caps CTAs in our references.

**Type.** Uppercase, `0.75rem` (12px), letter-spacing `0.08em`, weight 600.
Small + tracked + caps = the serious, label-like CTA we're after. One size only
for now. Padding is `em`-based (`1em 1.65em`), so it tracks the font size.

**Color story — three tiers, orange as the spark.** The Osmo effect works
because orange is the exciting *flash* mid-wipe. So the neutral buttons keep
orange as that flash, and the dedicated orange button — where orange is already
the rest color — does *not* flash (it can't be both rest and spark; that path
read as "only orange" in earlier tries). Buttons are **theme-independent
objects**: constant warm `--btn-paper` (`hsl(38 44% 97%)`) and `--btn-ink`
(`hsl(24 15% 11%)`), same in both modes, each given a faint self-defining border.

- **Primary** — `white → orange flash → black`, label dark → white. This *is*
  the original Osmo default. The leading panel is `--accent` (the flash), the
  fill is `--btn-ink`.
- **Secondary** — `black → orange flash → white`, the exact inverse. Same orange
  flash, fill is `--btn-paper`.
- **Accent** — `orange → black`. For nav / special CTAs. Calm hover: both panels
  are `--btn-ink`, so black simply wipes in with no flash, and the warm-white
  label stays put. *White-on-orange at rest is a deliberate, not-AA-perfect call.*

> **Why constants + a faint border, not theme tokens:** a fixed-white button is
> nearly invisible on the light cream bg, a fixed-black one on the dark bg. A
> hairline border (the *opposite* tone at 14% via `color-mix`) self-defines each
> button on any background, so white/black stay legible in both themes without a
> heavy outline. Consequence to watch: on the **light** theme the white primary
> is the quiet one and the black secondary is the loud one — a little inverted
> from the usual "primary = loudest."

> **Keep the base static.** The resting color lives on `__bg` and never
> animates — only the panels move over it (as in the original Osmo). An earlier
> "backstop" that cross-faded the base to the fill was removed: it made the whole
> button shift color *before* the wipe, which read as broken. The panels cover
> the base at full hover, so no backstop is needed.

**No border radius (for now).** `--btn-radius: 0`. Deliberate squared look while
we settle the overall visual language; flip one token to round everything later.

**Borderless trial (current).** The `__bg` hairline is `border: none` (the
`--btn-border` vars are dormant) — trialling all buttons without borders.
Consequence: `ghost` becomes a **text-only** label — reads as a quiet text link
beside `solid`. Restore `border: 1px solid var(--btn-border)` to bring hairlines
back. (Note: `1px solid transparent` is *not* equivalent — it leaves a 1px ring
of page-bg inside the border edge that reads as a hairline on hover when the fill
behind it is dark, so the borderless state must be true `none`.)

**Current colour system (borderless).** The two CTAs used on the page are now:

- **`primary` = ORANGE → theme fill.** Rest is `--accent` (orange), the loud CTA.
  No orange "flash" panel (orange is already the rest) — both wipe panels are
  `--text`, so hover wipes to **dark in light / light in dark**; the label crosses
  warm-white → page-colour. (This is the base `.c-button`, i.e. the default variant.)
- **`secondary` = WHITE on light / BLACK on dark.** Follows the page tone, so it's
  the *quiet* CTA (white reads quiet on cream, black quiet on the dark bg). Theme
  flip via a `:global([data-theme="dark"])` override (`#fff`+ink ↔ near-black+white).
  Orange flash → inverts to the opposite tone on hover.
- The **hero** uses `primary` (View work) + `secondary` (Get in touch); the **footer**
  CTA is the **`link`** variant (recoloured to `--footer-fg` warm-white via
  `--btn-link-color` on `.c-footer__btn`).
- `solid` / `ghost` still exist but are **unused on-page now**; `accent` likewise.

> Earlier iterations of these notes (primary = pure white, ghost = white) are
> superseded by the above. `--btn-paper`/`--btn-ink` remain the warm constants used
> for labels and the secondary's light-theme values.

**Wipe panels over-cover + a shallow tilt (the "left sliver" fix).** Two things
caused the rest-colour to peek during the wipe: (1) at `height:100%` the panel left
a hairline at the top edge, and (2) the `rotate(-10deg)` (origin top-right) sloped
the top edge **down to the left**, so the **top-left corner was covered last** — a
visible left sliver during hover. Fix: panels are `width:140%; height:160%` with a
hover end-translate of `0 -18% 0` (lifts the lagging corner above the top), and the
tilt is softened to **`-5deg`** so the corner barely lags. Full-hover end state is
clean; the transition reveal is near-uniform. (If any sliver still reads, the last
lever is `rotate: 0` — a fully horizontal wipe, no diagonal.)

**`link` variant — tertiary text-link CTA.** No panel, no padding; the label sits
inline with an optional external-link arrow (`icon` prop → Phosphor
"arrow-up-right", bold-faked with `fill` + `stroke-width: 8` exactly like the
[theme toggle](#theme-toggle--c-theme-toggle)). Hover warms the colour to
`--accent-ink` and nudges the arrow up-right (the external-link affordance,
gated behind no-reduced-motion). Used for the modal's **Live preview**.

**Motion.** One smooth ease, `cubic-bezier(0.32, 0.72, 0, 1)` — no overshoot, no
hover scale-up. Only a subtle press scale (`0.97`) for tactile feedback. See
Foundations → Motion for why we dropped Osmo's springy `linear()` ease.

**Variants** (via `data-variant`, overriding `--btn-*`):

| Variant | Rest | Hover | Theme-aware? |
| --- | --- | --- | --- |
| `primary` (default) | **orange**, warm-white text | no flash → wipes to `--text` (dark/light), label → page colour | **yes** (hover fill) |
| `secondary` | **white** (light) / **black** (dark), inverse text | orange flash → inverts to opposite tone | **yes** |
| `link` | text-only + optional external arrow; colour via `--btn-link-color` | colour → `--btn-link-hover` (`--accent-ink`), arrow nudges ↗ | inherits |
| `accent` | orange, white text | black wipes in (no flash) | no (constant) · *unused* |
| `solid` | **text-colour** bg, bg-colour label | orange flash → inverts | **yes** · *unused* |
| `ghost` | white, ink text | orange flash → ink fill | no (constant) · *unused* |

**Theme-aware variants (`solid` / `ghost`).** Unlike the three constant variants
above, these follow the theme via `--text` / `--bg`, so:

- `solid` is the **dominant** CTA — highest contrast in either mode:
  **black on light, white on dark**. (This is the "theme-aware dominant" we'd flagged
  was needed: a fixed paper/ink button can't be the loud one in *both* themes.)
- `ghost` is the **quiet secondary** — transparent with a hairline border, used
  *under* `solid` so the hierarchy reads in both themes.

The **hero** uses `View work` = `solid` (dominant) + `Get in touch` = `ghost`.

**Accessibility.**
- Focus ring is an `::after` box-shadow using `--accent` (ink on the orange
  `accent` variant, where an orange ring would be invisible), overriding the
  global `:focus-visible` outline (avoids a doubled ring).
- The hover choreography is gated behind
  `(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)`.
- Added on top of the raw Osmo code: a **reduced-motion fallback** that does an
  instant color swap on hover, so those users still get clear feedback instead
  of a dead hover.

**Usage.**

```astro
---
import Button from "../components/Button.astro";
---
<Button label="View work ↓" href="#work" variant="solid" />     {/* dominant, theme-aware */}
<Button label="Get in touch" variant="ghost"                    {/* quiet, theme-aware */}
  href="mailto:contato@brenodaroz.com" data-copy-email="contato@brenodaroz.com" />
<Button label="Submit" type="submit" />                         {/* renders <button> */}
```

`data-copy-email` turns any Button (or element) into a copy-to-clipboard trigger —
see [Contact pattern](#contact-pattern--copy--toast).

**Open questions / next.** Sizing scale (sm/lg), icon slot, disabled/loading
states, and whether to keep squared or round once the broader UI lands.

### Work section — `c-work`

[`src/components/WorkSection.astro`](src/components/WorkSection.astro), mounted
below the hero (`id="work"` — the hero's "View work ↓" now resolves). Chosen from
four `/lab` prototypes (cinematic slider / **editorial grid** / typographic index /
pinned stack) — the editorial grid won.

- Two columns, the **right column rides `--spacing-l` lower** for an asymmetric
  editorial rhythm; single column under 40rem.
- **16:9 thumbnails** (`aspect-ratio`), hover scale `1.04` inside a clipped frame.
- **Vertical rhythm trimmed** (top padding `2xl→l`, row gap `2xl→l`, right-column
  offset `2xl→l`). The big 16:9 thumbnails are tall, so the old `2xl` rhythm only
  fit *one row* above the fold (the "only 2 projects on load" complaint) — the
  tighter spacing peeks the second row in (~4 projects visible on a ~1300px-tall
  viewport).
- **Reveal orchestration.** Heading + cards (`.js-work-reveal`, `data-reveal`
  FOUC-guarded) slide up + fade on the modal's premium ease-out via a
  **`ScrollTrigger.batch`** (`start: "top 92%"` so they animate as they *enter*,
  not after you scroll past). The batch is created only **after the hero intro**:
  the hero dispatches a `hero:revealed` event (every entry path — animated,
  reduced, error) and the section waits for it (with a `2.4s` fallback). So the
  first-viewport cards animate in *after* the hero settles, the rest as they
  scroll into view. Triggers are killed on `astro:before-swap`.
- Cards are real `<a href="/work/[slug]">` links (no-JS/SEO fallback) with
  `data-work-project` to open the modal. **`data-astro-reload` is load-bearing:**
  without it Astro's ClientRouter intercepts the click *before* the delegated
  `preventDefault` and navigates instead of opening the modal.
- Data is **mock for now** ([`src/lib/work-projects.ts`](src/lib/work-projects.ts)),
  shaped to mirror `PROJECTS_QUERY` so the Sanity swap is mechanical. Covers are
  gradient placeholders in `public/placeholders/`.

### Project modal — `c-pmodal`

[`src/components/ProjectModal.astro`](src/components/ProjectModal.astro), mounted
in `index.astro` **outside `#main`** (slot `footer`) so it escapes `#main`'s
stacking context and isn't affected by the open-state page scale.

**Reads as a card-sheet over the site** (iOS-sheet language): a dark warm scrim
(`rgb(14 10 7 / .55)`) fades in while the panel (top-radius `--radius-lg`,
`--shadow-5`, 4.5svh top gap) rises from the bottom. The clicked thumbnail
**flies into the panel's hero slot** via GSAP **Flip.fit on a fixed CLONE** — the
original images never move:

> **Why a clone, not reparenting.** The first build reparented the real `<img>`
> into the modal and Flip-ed the delta — it read clanky, especially on close: the
> card's hover-scale transition and the modal's `absolute` positioning kept
> interfering at the endpoints. A clone in a dedicated flight layer has no CSS
> transitions, no layout dependencies, and both real images just toggle
> `visibility` at the choreography's edges. Same 16:9 at both ends → pure
> translate/scale flight (`Flip.fit … scale: true`), zero distortion.

- **Motion is EASE-OUT, not the default ease-in-out.** The modal *enters* the
  viewport, so per the animation-design skill it should decelerate into place —
  a `CustomEase` of `0.16,1,0.3,1` (= our `--ease-out-expo`): jumps toward its
  spot then settles, the premium decel feel. (We tried `--ease-default`'s
  symmetric in-out first — it felt heavier/clankier for an entrance.)
- **Choreography (open, all on the ease-out):** scrim + panel rise + clone flight
  share the **exact same ease + duration (`0.55s`)** so the image looks anchored
  inside the rising panel · info column drifts **up (`y:24`) + fades in** on the
  same ease, staggered from `0.18s`. Close reverses ~20% faster (`0.44s`) and only
  flies the image back **if the hero is still near-view** (scroll <60% of hero
  height) — otherwise the sheet dismisses and the thumbnail restores under the fade.
- **No page scale.** An earlier version scaled `#main` to `0.97` for depth — cut:
  it added little, and its `clearProps` on close snapped the card back to full
  size *after* the clone had already landed at the scaled position (the "weird
  snap on return"). Removing it made the return seamless; the scrim carries the depth.
- **Layout:** screenshot list (hero + `gallery[]`) on one side, **sticky info
  column** (title → Live preview CTA → description → hairline rows) on the other.
  Sides swap by flipping `data-media-side` on `.c-pmodal__layout` — the
  grid-template-areas do the rest. Sticky `top` matches the layout's top padding
  (`--spacing-m`) so the info holds the same inset as the hero, not the panel edge.
- **Inner scroller for clean corners.** The panel is `overflow:hidden` (clips both
  rounded top corners) and an inner `.c-pmodal__scroll` does the scrolling with its
  **native scrollbar hidden** — a scrollbar on the panel itself squared off the
  top-right corner. Scrolls via wheel/trackpad/keyboard; the gallery peeking below
  is the affordance. `.c-pmodal__shots` carries its own gap so all gallery images
  are evenly spaced (was: only the hero↔shots gap showed, so the first looked like
  the only spaced one).
- **GSAP-owns-the-transform gotcha:** the panel must NOT have a CSS rest
  `translateY(103%)` — computed styles hand GSAP a *pixel* matrix that becomes a
  base `y`, and tweened `yPercent` **compounds** on it (panel + measured flight
  target land a full panel-height low). Rest state = root `display:none`; GSAP
  sets `yPercent` explicitly on open.
- **Close (`×`) is a plain icon** — no circle/border/background (the `3rem` box
  is just the ≥44px tap target), muted at rest → full on hover, with a faint
  drop-shadow so it stays legible over imagery on mobile. It **fades + slides in
  with the info column** (was an instant pop) and fades out on close.
- Scroll-locks `<html>` with scrollbar-gutter compensation; Escape / overlay /
  close button dismiss; focus returns to the card; reduced-motion gets instant
  states (no flight).

### Contact pattern — copy + toast

There is **no `mailto:`-as-primary** action. Every contact CTA **copies the email
to the clipboard** and shows a confirmation toast — a deliberate UX choice over
launching a mail client.

- **One email constant:** `CONTACT_EMAIL` in
  [`src/lib/site.ts`](src/lib/site.ts) — `contato@brenodaroz.com` for now. Hardcoded
  on purpose; swap to CMS (Site Settings) later in this one place.
- **Trigger:** any element with `data-copy-email="…"`. A single **delegated**
  click handler + one toast instance live in
  [`Base.astro`](src/layouts/Base.astro), so it survives Astro View-Transition
  swaps and needs no per-component wiring.
- **`href="mailto:…"` stays** on each CTA as a **no-JS fallback**; the handler
  `preventDefault`s it when JS is live. Clipboard needs a secure context + focus
  (localhost / https); if it throws, the toast still surfaces the address so the
  click is never a dead end.
- **CTAs:** hero **Get in touch**, footer **Get in touch**.
- **Toast:** fixed bottom-centre pill, `role="status"` + `aria-live="polite"`,
  theme-token colours (`--text` bg / `--bg` text), auto-hides ~2.2s.

### Footer — `c-footer`

[`src/components/SiteFooter.astro`](src/components/SiteFooter.astro). A **reveal
footer**: `position: sticky; bottom: 0` behind `#main` (which is opaque, `z-index:
1`); the page lifts away on scroll to uncover it. Parallax drift on the inner via
GSAP ScrollTrigger. Kept **shorter than the viewport** so it never reaches up behind
the translucent header; `overflow: hidden` clips the drift + the wordmark.

**Depth — foreground panel.** `#main` carries a large, soft **downward shadow** (4
layers up to 120px blur, low alpha) so the footer reads as a recessed background
layer at the reveal seam. (We tried a border-radius on the seam too — removed; the
shadow alone reads cleaner and more premium.)

**Contact card (top row).**
- **Desktop:** lead (eyebrow → headline → white `Get in touch` button, the `primary`
  variant) on the left; meta column (socials, location) **right-aligned and
  bottom-aligned** to the button baseline.
- Socials render inline as `LinkedIn / X` (hairline `/` separator), real URLs,
  `target="_blank" rel="me noopener"`.
- **Mobile (< 40rem):** the row stacks to a column, **everything left-aligned**
  (no right-alignment anywhere), and the panel shortens to `min-height: 46svh`
  (58svh on desktop).

**Wordmark.** Oversized `BRENO` in Archivo Black, pinned to the bottom edge, softly
dissolved by the bottom progressive-blur.
- **Full-bleed:** `width: 100vw` + `left: 50%; margin-left: -50vw`. Requires
  `max-width: none` to beat the global `svg { max-width: 100% }` reset (which
  otherwise silently clamps it to the container width).
- **Letter-spacing `-0.1em`** — very tight; the heavy Black weight carries it. A fit
  script (`fitWordmark`) measures the live ink box via canvas `measureText` and sets
  the `viewBox` so glyphs sit flush to all edges; it reads the **live**
  letter-spacing, so tracking tweaks stay accurate automatically.
- **Bottom crop `margin-bottom: -8vw`** — in **`vw`, not `rem`**: the mark is
  full-bleed so its height scales with viewport width, and a `vw` crop slices the
  **same proportion** (~39%) at every screen size. A fixed `rem` over-crops narrow
  screens and under-crops wide ones.

> **Parallax / height coupling (deferred).** The reveal ScrollTrigger's end point
> loosely assumes the 58svh footer height. The mobile 46svh ends the scrubbed drift
> a touch early but lands gracefully (no visible glitch). To make it exact, read the
> actual footer height in the trigger instead of hard-assuming 58svh.
