import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '#/infrastructure/config/env';
import type { RateLimiter } from '#/domain/ports/rate-limiter';

// 20 calls per key per minute. Tune to taste.
// ponytail: no-op when Upstash creds aren't set (e.g. local dev) instead of
// throwing at import time. Real limiting kicks in once env vars are set.
export function createRateLimiter(): RateLimiter {
  const limiter =
    env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
      ? new Ratelimit({
          redis: new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN }),
          limiter: Ratelimit.slidingWindow(20, '1 m'),
          prefix: 'chat',
        })
      : null;

  return {
    async check(key) {
      if (!limiter) return { ok: true, retryAfter: 0 };
      const { success, reset } = await limiter.limit(key);
      return { ok: success, retryAfter: success ? 0 : Math.ceil((reset - Date.now()) / 1000) };
    },
  };
}
