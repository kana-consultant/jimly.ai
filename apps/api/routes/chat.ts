import { withUser } from '#/presentation/http/with-user';
import { validateChatRequest } from '#/presentation/http/validate';

export const config = { runtime: 'nodejs' };

const handler = withUser(async ({ req, ctx, useCases }) => {
  const body = validateChatRequest(await req.json());
  if (!body) return Response.json({ error: 'Invalid request body' }, { status: 400 });

  const stream = await useCases.sendMessage(body, ctx);
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
});

export default handler;
export { handler as POST, handler as OPTIONS };
