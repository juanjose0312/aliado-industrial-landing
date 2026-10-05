// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Salida estática; solo /api/lead se renderiza bajo demanda (export const prerender = false).
export default defineConfig({
  site: 'https://aliadoindustrial.com.co',
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'never',
  // CSS en línea: evita la petición bloqueante y adelanta el LCP (el H1) en móvil.
  build: { inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
