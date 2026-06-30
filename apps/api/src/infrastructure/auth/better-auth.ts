import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '#/infrastructure/db/client';
import * as authSchema from '#/infrastructure/db/auth-schema';
import { env } from '#/infrastructure/config/env';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema: authSchema }),
  emailAndPassword: { enabled: true },
  // Our own Upstash-based limiter already wraps every /api/auth/* request
  // (see ../ratelimit/upstash.ts). better-auth's built-in in-memory limiter
  // runs a periodic cleanup interval that keeps the Node process non-idle,
  // which made `vercel dev` hang delivering the HTTP response.
  rateLimit: { enabled: false },
  // SECURITY: lock CSRF + OAuth redirects to known origins only. Better Auth
  // cookies are httpOnly by default.
  trustedOrigins: [env.BETTER_AUTH_URL, ...(env.WEB_ORIGIN ? [env.WEB_ORIGIN] : [])],
  // Frontend (apps/backoffice) and api are deployed to different origins in
  // prod — cookies must be cross-site: SameSite=None + Secure, scoped to the
  // shared parent domain. Unset COOKIE_DOMAIN (local dev) keeps the default
  // same-origin (SameSite=Lax) cookie behavior.
  ...(env.COOKIE_DOMAIN && {
    advanced: {
      crossSubDomainCookies: { enabled: true, domain: env.COOKIE_DOMAIN },
      defaultCookieAttributes: { secure: true, sameSite: 'none' as const, partitioned: true },
    },
  }),
});
