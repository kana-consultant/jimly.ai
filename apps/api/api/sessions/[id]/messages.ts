import { withUser } from '../../_lib/with-user';
import { validateMessage } from '../../_lib/validate';

export const config = { runtime: 'edge' };

export default withUser(async ({ req, repo }) => {
  const parts = new URL(req.url).pathname.split('/');
  const sessionId = parts[parts.indexOf('sessions') + 1]!;
  if (req.method === 'GET') return Response.json(await repo.listMessages(sessionId));
  if (req.method === 'POST') {
    const body = validateMessage(await req.json());
    if (!body) return Response.json({ error: 'Invalid request body' }, { status: 400 });
    await repo.addMessage(body);
    return Response.json({ ok: true });
  }
  return new Response('Method Not Allowed', { status: 405 });
});
