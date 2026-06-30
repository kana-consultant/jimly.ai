import { withUser } from '#/presentation/http/with-user';
import { validateChatRequest } from '#/presentation/http/validate';

export const config = { runtime: 'nodejs' };

// @vercel/node's dev server only recognizes Web-style Request->Response
// handlers via named HTTP-method exports (or `fetch`); a bare default export
// falls through to the legacy Node (req,res) path and hangs forever since we
// never call res.end().
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
