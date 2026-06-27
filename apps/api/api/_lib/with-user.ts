import { auth } from '#/infrastructure/auth/better-auth';
import { db } from '#/infrastructure/db/client';
import { createNeonChatRepository } from '#/infrastructure/db/repositories/neon-chat-repository';
import { createPerfect10Gateway } from '#/infrastructure/ai/perfect10-gateway';
import { createRateLimiter } from '#/infrastructure/ratelimit/upstash';
import { buildUseCases, type UseCases } from '#/application/use-cases';
import type { AuthedContext } from '#/application/shared/context';

type Handler = (c: { req: Request; ctx: AuthedContext; useCases: UseCases }) => Promise<Response>;

// Per-request composition root: authenticate → build scoped deps → assemble use-cases.
export function withUser(handler: Handler) {
  return async (req: Request): Promise<Response> => {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.user?.id;
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const ctx: AuthedContext = { userId, origin: new URL(req.url).origin, headers: req.headers };
    const useCases = buildUseCases({
      repo: createNeonChatRepository(db, userId),
      gateway: createPerfect10Gateway(),
      rateLimiter: createRateLimiter(),
    });
    return handler({ req, ctx, useCases });
  };
}
