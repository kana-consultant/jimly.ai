import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// 20 chat calls per user per minute. Tune to taste.
const limiter = new Ratelimit({
  redis: Redis.fromEnv(), // reads UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  prefix: 'chat',
});

// Returns a 429 Response when the user is over budget, else null.
export async function checkRateLimit(userId: string): Promise<Response | null> {
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
