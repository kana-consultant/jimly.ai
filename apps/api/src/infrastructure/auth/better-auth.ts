import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '#/infrastructure/db/client';
import * as authSchema from '#/infrastructure/db/auth-schema';
import { env } from '#/infrastructure/config/env';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema: authSchema }),
  emailAndPassword: { enabled: true },
  rateLimit: { enabled: false },
  trustedOrigins: [env.BETTER_AUTH_URL, ...(env.WEB_ORIGIN ? [env.WEB_ORIGIN] : ['http://localhost:5173'])],
  ...(env.COOKIE_DOMAIN && {
    advanced: {
      crossSubDomainCookies: { enabled: true, domain: env.COOKIE_DOMAIN },
      defaultCookieAttributes: { secure: true, sameSite: 'none' as const, partitioned: true },
    },
  }),
});
