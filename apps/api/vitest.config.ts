import { defineConfig } from 'vitest/config';
import path from 'node:path';

// .env lives at repo root (shared); load it into process.env so it reaches
// src/db/client.ts the same way it does under drizzle-kit. Uses Node's
// built-in loader instead of vite's so apps/api has no direct `vite`
// dependency — Vercel's framework detector otherwise misreads this
// functions-only project as a Vite app.
process.loadEnvFile(path.resolve(__dirname, '../../.env'));

export default defineConfig({
  test: {
    // Repository tests hit real Neon Postgres over HTTP — 5s default is too tight.
    testTimeout: 20000,
  },
});
