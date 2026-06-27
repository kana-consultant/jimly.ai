import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '#/infrastructure/config/env';
import type { RateLimiter } from '#/domain/ports/rate-limiter';

// ponytail: no-op when Upstash creds aren't set (e.g. local dev) instead of
// throwing at import time. Real limiting kicks in once env vars are set.
const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
    : null;

type RatelimitAlgorithm = ConstructorParameters<typeof Ratelimit>[0]['limiter'];

function makeLimiter(prefix: string, limiter: RatelimitAlgorithm): RateLimiter {
  const rl = redis ? new Ratelimit({ redis, limiter, prefix }) : null;
  return {
    async check(key) {
      if (!rl) return { ok: true, retryAfter: 0 };
      const { success, reset } = await rl.limit(key);
      return { ok: success, retryAfter: success ? 0 : Math.ceil((reset - Date.now()) / 1000) };
    },
  };
}

// 20 calls per authed user per minute, across all authed routes.
export function createRateLimiter(): RateLimiter {
  return makeLimiter('chat', Ratelimit.slidingWindow(20, '1 m'));
}

// 10 calls per IP per 5 minutes on /api/auth/* — deters credential
// stuffing / signup abuse on the (unauthenticated) auth routes.
export function createAuthRateLimiter(): RateLimiter {
  return makeLimiter('auth', Ratelimit.slidingWindow(10, '5 m'));
}
