import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// 20 chat calls per user per minute. Tune to taste.
// ponytail: no-op when Upstash creds aren't set (e.g. local dev) instead of
// throwing at import time. Real limiting kicks in once env vars are set.
const limiter =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(20, '1 m'),
        prefix: 'chat',
      })
    : null;

// Returns a 429 Response when the user is over budget, else null.
export async function checkRateLimit(userId: string): Promise<Response | null> {
  if (!limiter) return null;
  const { success, reset } = await limiter.limit(userId);
  if (success) return null;
  return Response.json(
    { error: 'Rate limit exceeded' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) },
    },
  );
}
