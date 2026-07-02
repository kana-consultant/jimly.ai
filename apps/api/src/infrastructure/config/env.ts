import { z } from 'zod';

// `.env` keeps unused vars as empty strings ("UPSTASH_...="); treat "" as unset.
const optional = <T extends z.ZodTypeAny>(s: T) =>
  z.preprocess((v) => (v === '' ? undefined : v), s.optional());

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),
  PERFECT10_API_URL: z.string().url(),
  PERFECT10_API_KEY: z.string().min(1),
  PERFECT10_AGENT_ID: z.coerce.number().int(),
  UPSTASH_REDIS_REST_URL: optional(z.string().url()),
  UPSTASH_REDIS_REST_TOKEN: optional(z.string().min(1)),
  WEB_ORIGIN: optional(z.string().url()),
  COOKIE_DOMAIN: optional(z.string().min(1)),
});

export const env = schema.parse(process.env);
export type Env = z.infer<typeof schema>;
