import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [
    preact({ compat: true }), // Enable Preact compat mode for React-like patterns
    tailwind({ applyBaseStyles: false }) // We'll manage base styles manually
  ],
  output: 'static', // SSG for Cloudflare Pages
  build: {
    format: 'file', // /about.html instead of /about/index.html
    inlineStylesheets: 'auto'
  },
  vite: {
    optimizeDeps: {
      exclude: ['@astrojs/preact']
    }
  }
});