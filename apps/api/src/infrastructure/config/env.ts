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
  // Optional: no-op rate limiter when unset (local dev).
  UPSTASH_REDIS_REST_URL: optional(z.string().url()),
  UPSTASH_REDIS_REST_TOKEN: optional(z.string().min(1)),
  // Cross-origin web app origin — CORS allow-list + better-auth trusted origin.
  // Optional: unset means same-origin (local dev via the vite proxy); no CORS
  // headers are sent and cross-site cookies stay off.
  WEB_ORIGIN: optional(z.string().url()),
  // Shared parent domain (e.g. ".jimly.ai") for cross-subdomain auth cookies.
  // Optional: unset means same-origin cookies (local dev); set in prod where
  // the frontend and api are deployed to sibling subdomains.
  COOKIE_DOMAIN: optional(z.string().min(1)),
});

export const env = schema.parse(process.env);
export type Env = z.infer<typeof schema>;
