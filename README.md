# Portfolio

Astro portfolio for breno.work. The legacy brenodaroz.com domains should
permanently redirect to the matching breno.work paths.

## Commands

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server |
| `npm run build` | Build production output to `dist/` |
| `npm run preview` | Preview the production build |

## Deployment Notes

- The site is served behind Cloudflare. Cloudflare Pages has a `25 MiB` limit per deployed asset.
- Keep project preview videos under `25 MiB`; otherwise the deployment can fail and production may keep serving the previous build.
- When replacing media bytes, bump `ASSET_VERSION` in `src/lib/work-projects.ts` so thumbnails/videos get fresh URLs.
- Current project preview videos are 60fps H.264 MP4s at `1918x944`, exported as `public/work/<slug>/demo-1080p.mp4`.
