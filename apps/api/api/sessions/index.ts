import { withUser } from '#/presentation/http/with-user';
import { validateNewSession } from '#/presentation/http/validate';

export const config = { runtime: 'nodejs' };

// @vercel/node's dev server only recognizes Web-style Request->Response
// handlers via named HTTP-method exports (or `fetch`); a bare default export
// falls through to the legacy Node (req,res) path and hangs forever since we
// never call res.end().
const handler = withUser(async ({ req, useCases }) => {
  if (req.method === 'GET') return Response.json(await useCases.listSessions());
  if (req.method === 'POST') {
    const body = validateNewSession(await req.json());
    if (!body) return Response.json({ error: 'Invalid request body' }, { status: 400 });
    await useCases.createSession(body);
    return Response.json({ ok: true });
  }
  return new Response('Method Not Allowed', { status: 405 });
});

export default handler;
export { handler as GET, handler as POST, handler as OPTIONS };
