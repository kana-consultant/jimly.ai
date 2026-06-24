import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig(({ mode }) => ({
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    // Load all vars from .env (not just VITE_-prefixed) so process.env.DATABASE_URL
    // reaches src/db/client.ts the same way it does under `vite`/`drizzle-kit`.
    env: loadEnv(mode, process.cwd(), ''),
    // Repository tests hit the real Neon Postgres over HTTP (multiple sequential
    // round trips per test) — the 5s default is too tight for real network I/O.
    testTimeout: 20000,
  },
}));
