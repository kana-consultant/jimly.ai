import { withUser } from '../_lib/with-user';
import { validateNewSession } from '../_lib/validate';

export const config = { runtime: 'edge' };

export default withUser(async ({ req, useCases }) => {
  if (req.method === 'GET') return Response.json(await useCases.listSessions());
  if (req.method === 'POST') {
    const body = validateNewSession(await req.json());
    if (!body) return Response.json({ error: 'Invalid request body' }, { status: 400 });
    await useCases.createSession(body);
    return Response.json({ ok: true });
  }
  return new Response('Method Not Allowed', { status: 405 });
});
