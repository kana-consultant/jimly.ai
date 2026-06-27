import { withUser } from './_lib/with-user';
import { AppError } from '#/application/shared/errors';

export const config = { runtime: 'edge' };

interface Body {
  chatId: string;
  messages: { role: string; content: string }[];
}

export default withUser(async ({ req, ctx, useCases }) => {
  const limit = await useCases.checkRateLimit(ctx.userId);
  if (!limit.ok)
    return Response.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );

  const { chatId, messages } = (await req.json()) as Body;
  const last = messages[messages.length - 1];
  if (!last) return Response.json({ error: 'No message to send' }, { status: 400 });

  try {
    const stream = await useCases.sendChat({ chatId, content: last.content }, ctx);
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
  } catch (e) {
    if (e instanceof AppError) return Response.json({ error: e.message }, { status: e.status });
    throw e;
  }
});
