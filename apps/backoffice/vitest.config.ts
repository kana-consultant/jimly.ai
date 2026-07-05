import { defineConfig } from 'vitest/config';

// Backend tests moved to @jimly/api. No frontend unit tests yet.
export default defineConfig({
  test: { passWithNoTests: true },
});
