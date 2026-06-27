import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig(({ mode }) => ({
  test: {
    // .env lives at repo root (shared); load all vars so process.env.DATABASE_URL
    // reaches src/db/client.ts the same way it does under drizzle-kit.
    env: loadEnv(mode, path.resolve(__dirname, '../..'), ''),
    // Repository tests hit real Neon Postgres over HTTP — 5s default is too tight.
    testTimeout: 20000,
  },
}));
