// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  trailingSlash: 'always',

  vite: {
    plugins: [tailwindcss()],
  },

  // Las fichas de prueba se buildean para el botón del header, pero no se
  // indexan: /books/demo/... y /essays/demo/... quedan fuera del sitemap.
  integrations: [sitemap({ filter: (page) => !/\/demo\//.test(page) })],
});
