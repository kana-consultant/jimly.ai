// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  integrations: [react()],
  // .env lives at repo root, shared with the backoffice app.
  vite: { plugins: [tailwindcss()], envDir: '../../' },
});
