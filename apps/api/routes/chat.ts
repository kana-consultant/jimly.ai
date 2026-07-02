import { withUser } from '#/presentation/http/with-user';
import { validateChatRequest } from '#/presentation/http/validate';
import { badRequest } from '#/presentation/http/respond';

export const config = { runtime: 'nodejs' };

const handler = withUser(async ({ req, ctx, useCases }) => {
  const body = validateChatRequest(await req.json());
  if (!body) return badRequest();

  const stream = await useCases.sendMessage(body, ctx);
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
      Connection: 'keep-alive',
    },
  });
});

export default handler;
export { handler as POST, handler as OPTIONS };
