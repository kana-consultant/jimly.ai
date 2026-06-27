import { auth } from '#/infrastructure/auth/better-auth';
import { createAuthRateLimiter } from '#/infrastructure/ratelimit/upstash';
import { preflightResponse, withCors } from '../_lib/cors';

export const config = { runtime: 'edge' };

const rateLimiter = createAuthRateLimiter();

function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export default async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return preflightResponse(origin);

  const limit = await rateLimiter.check(clientIp(req));
  if (!limit.ok) {
    return withCors(
      origin,
      Response.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
      ),
    );
  }

  return withCors(origin, await auth.handler(req));
}
