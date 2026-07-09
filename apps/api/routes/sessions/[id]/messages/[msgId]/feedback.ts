import { withUser } from '#/presentation/http/with-user';
import { validateFeedback } from '#/presentation/http/validate';
import { badRequest } from '#/presentation/http/respond';

export const config = { runtime: 'nodejs' };

const handler = withUser(async ({ req, ctx, useCases }) => {
  const parts = new URL(req.url).pathname.split('/');
  const msgId = parts[parts.indexOf('messages') + 1]!;

  if (req.method === 'POST') {
    const body = validateFeedback(await req.json());
    if (!body) return badRequest();
    await useCases.saveFeedback({ messageId: msgId, value: body.value }, ctx);
    return Response.json({ ok: true });
  }

  if (req.method === 'DELETE') {
    await useCases.deleteFeedback({ messageId: msgId }, ctx);
    return Response.json({ ok: true });
  }

  return new Response('Method Not Allowed', { status: 405 });
});

export default handler;
export { handler as POST, handler as DELETE, handler as OPTIONS };
