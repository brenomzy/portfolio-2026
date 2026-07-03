// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Production URL — used for canonical/OG links + sitemap.
  site: 'https://breno.work',

  vite: {
    plugins: [tailwindcss()],
  },
});
