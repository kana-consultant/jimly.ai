import { withUser } from '#/presentation/http/with-user';
import { validateMessage } from '#/presentation/http/validate';
import { badRequest } from '#/presentation/http/respond';

export const config = { runtime: 'nodejs' };

const handler = withUser(async ({ req, useCases }) => {
  const parts = new URL(req.url).pathname.split('/');
  const sessionId = parts[parts.indexOf('sessions') + 1]!;
  if (req.method === 'GET') return Response.json(await useCases.listMessages(sessionId));
  if (req.method === 'POST') {
    const body = validateMessage(await req.json());
    if (!body) return badRequest();
    await useCases.addMessage(body);
    return Response.json({ ok: true });
  }
  return new Response('Method Not Allowed', { status: 405 });
});

export default handler;
export { handler as GET, handler as POST, handler as OPTIONS };
