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

Geist (sans + mono). Fluid scale `--text-step--1 … 6` via `clamp()`
(320 → 1240px). Mono is reserved for small meta/labels (counts, clock).

### Space

Fluid scale `--spacing-3xs … 3xl`, also `clamp()`-based. Used both as Tailwind
utilities (`p-m`, `gap-l`) and raw vars in scoped component CSS.

### Radius

`--radius-sm … xl` exist for cards/media. **Buttons are intentionally squared
(radius 0)** for now — see below.

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
On load the logo, then the Contact button, then the toggle **blur-in**: `gsap.from`
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
- **Right** — `Contact me` (the `accent` Button variant) + the theme toggle,
  sized as siblings (see below).

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

**One file, theme-aware via `currentColor`.** The mark (left glyph) keeps its
fixed orange gradient — brand identity, theme-independent. The wordmark letters
are `fill="currentColor"`, so the logo follows the active theme automatically
(warm ink on light, warm white on dark) with **no flash and no light/dark file
swap**. Preferred over shipping two SVGs and toggling `display`.

> The mark's gradient (`#FFB039 → #FF6E2B`, a warm yellow-orange) is intentionally
> left as the supplied brand asset — it runs slightly warmer than the site
> `--accent` (`#FF4E2A`). Retune only if the clash becomes a problem.

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

**Motion.** One smooth ease, `cubic-bezier(0.32, 0.72, 0, 1)` — no overshoot, no
hover scale-up. Only a subtle press scale (`0.97`) for tactile feedback. See
Foundations → Motion for why we dropped Osmo's springy `linear()` ease.

**Variants** (via `data-variant`, overriding `--btn-*`):

| Variant | Rest | Hover |
| --- | --- | --- |
| `primary` (default) | white, dark text | orange flash → black, white text |
| `secondary` | black, white text | orange flash → white, dark text |
| `accent` | orange, white text | black wipes in (no flash), white text |

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
<Button label="Get in touch" href="#" />                        {/* primary, white */}
<Button label="View work ↓" href="#work" variant="secondary" /> {/* black */}
<Button label="Start a project" href="#" variant="accent" />    {/* orange — nav/CTA */}
<Button label="Submit" type="submit" />                         {/* renders <button> */}
```

**Open questions / next.** Sizing scale (sm/lg), icon slot, disabled/loading
states, and whether to keep squared or round once the broader UI lands.
