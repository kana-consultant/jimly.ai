import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '#/infrastructure/db/client';
import { env } from '#/infrastructure/config/env';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
  // SECURITY: lock CSRF + OAuth redirects to the known origin. Better Auth cookies are httpOnly + secure (sameSite=lax) by default.
  trustedOrigins: [env.BETTER_AUTH_URL],
});
