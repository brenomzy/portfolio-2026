// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Set to your production URL before deploy (used for canonical/OG links + sitemap).
  site: 'https://example.com',

  vite: {
    plugins: [tailwindcss()],
  },
});
