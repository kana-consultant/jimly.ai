import { withUser } from './_lib/with-user';
import { validateChatRequest } from './_lib/validate';

export const config = { runtime: 'edge' };

export default withUser(async ({ req, ctx, useCases }) => {
  const body = validateChatRequest(await req.json());
  if (!body) return Response.json({ error: 'Invalid request body' }, { status: 400 });

  const stream = await useCases.sendMessage(body, ctx);
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
});
