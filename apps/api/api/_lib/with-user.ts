import { db } from '../../src/db/client';
import { auth } from '../../src/auth/server';
import { createNeonChatRepository } from '../../src/services/neon-chat-repository';
import type { ChatRepository } from '../../src/services/chat-repository';

type Handler = (ctx: { req: Request; userId: string; repo: ChatRepository }) => Promise<Response>;

export function withUser(handler: Handler) {
  return async (req: Request): Promise<Response> => {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.user?.id;
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    return handler({ req, userId, repo: createNeonChatRepository(db, userId) });
  };
}
