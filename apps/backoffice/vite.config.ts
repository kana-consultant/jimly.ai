import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  // .env lives at repo root, shared with the landing app (VITE_-prefixed vars only).
  envDir: path.resolve(__dirname, '../..'),
  server: {
    port: 5173,
    // ponytail: dev proxy to the standalone @jimly/api dev server. Prod is
    // cross-origin via VITE_API_URL (Phase 4); local stays same-origin /api.
    proxy: { '/api': 'http://localhost:3001' },
  },
});
