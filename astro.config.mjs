// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sanity from '@sanity/astro';

// https://astro.build/config
export default defineConfig({
  // Set to your production URL before deploy (used for canonical/OG links + sitemap).
  site: 'https://example.com',

  integrations: [
    sanity({
      projectId: 'feb37gnz',
      dataset: 'production',
      // Pinned API version — bump deliberately, never float.
      apiVersion: '2025-06-01',
      // Build pulls fresh content (rebuild is triggered on publish); CDN not needed.
      useCdn: false,
      // No embedded Studio — the Studio is a standalone app in ./studio-portfolio.
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
