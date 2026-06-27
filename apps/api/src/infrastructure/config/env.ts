import { z } from 'zod';

// `.env` keeps unused vars as empty strings ("UPSTASH_...="); treat "" as unset.
const optional = <T extends z.ZodTypeAny>(s: T) =>
  z.preprocess((v) => (v === '' ? undefined : v), s.optional());

// Single validated source of env. Throws (listing every offending var) at first import
// if anything required is missing or malformed — fail fast at startup, not mid-request.
const schema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),
  PERFECT10_API_URL: z.string().url(),
  PERFECT10_API_KEY: z.string().min(1),
  PERFECT10_AGENT_ID: z.coerce.number().int(),
  // Optional: no-op rate limiter when unset (local dev). Wired in Phase 4.
  UPSTASH_REDIS_REST_URL: optional(z.string().url()),
  UPSTASH_REDIS_REST_TOKEN: optional(z.string().min(1)),
  // Cross-origin web app origin. Required in Phase 4; optional for now.
  WEB_ORIGIN: optional(z.string().url()),
});

export const env = schema.parse(process.env);
export type Env = z.infer<typeof schema>;
