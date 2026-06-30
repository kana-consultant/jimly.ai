import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '#/infrastructure/config/env';

function makeRateLimiter(requests: number, window: `${number} ${'s' | 'm' | 'h' | 'd'}`) {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return { check: async (_key: string) => ({ ok: true, retryAfter: 0 }) };
  }

  const ratelimit = new Ratelimit({
    redis: new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN }),
    limiter: Ratelimit.slidingWindow(requests, window),
  });

  return {
    check: async (key: string) => {
      const { success, reset } = await ratelimit.limit(key);
      return { ok: success, retryAfter: Math.ceil((reset - Date.now()) / 1000) };
    },
  };
}

export const createAuthRateLimiter = () => makeRateLimiter(10, '10 s');
export const createRateLimiter = () => makeRateLimiter(60, '1 m');
