import { auth } from '#/infrastructure/auth/better-auth';
import { db } from '#/infrastructure/db/client';
import { createNeonChatRepository } from '#/infrastructure/db/repositories/neon-chat-repository';
import { createPerfect10Gateway } from '#/infrastructure/ai/perfect10-gateway';
import { createRateLimiter } from '#/infrastructure/ratelimit/upstash';
import { buildUseCases, type UseCases } from '#/application/use-cases';
import type { AuthedContext } from '#/application/shared/context';
import { respond } from './respond';
import { preflightResponse, withCors } from './cors';

type Handler = (c: { req: Request; ctx: AuthedContext; useCases: UseCases }) => Promise<Response>;

const rateLimiter = createRateLimiter();

async function authenticateRequest(req: Request): Promise<string | null> {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user?.id ?? null;
}

function resolveRequestOrigin(req: Request): string {
  const origin = req.headers.get('origin');
  if (origin) return origin;
  const referer = req.headers.get('referer');
  return referer ? new URL(referer).origin : new URL(req.url).origin;
}

export function withUser(handler: Handler) {
  return async (req: Request): Promise<Response> => {
    const origin = req.headers.get('origin');
    if (req.method === 'OPTIONS') return preflightResponse(origin);

    const res = await respond(async () => {
      const userId = await authenticateRequest(req);
      if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const limit = await rateLimiter.check(userId);
      if (!limit.ok) {
        return Response.json(
          { error: 'Rate limit exceeded' },
          { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
        );
      }

      const ctx: AuthedContext = { userId, origin: resolveRequestOrigin(req), headers: req.headers };
      const useCases = buildUseCases({
        repo: createNeonChatRepository(db, userId),
        gateway: createPerfect10Gateway(),
      });
      return handler({ req, ctx, useCases });
    });

    return withCors(origin, res.body, { status: res.status, headers: res.headers });
  };
}
