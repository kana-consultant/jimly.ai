import { withUser } from '#/presentation/http/with-user';
import { validateSessionPatch } from '#/presentation/http/validate';

export const config = { runtime: 'nodejs' };

// @vercel/node's dev server only recognizes Web-style Request->Response
// handlers via named HTTP-method exports (or `fetch`); a bare default export
// falls through to the legacy Node (req,res) path and hangs forever since we
// never call res.end().
const handler = withUser(async ({ req, useCases }) => {
  const id = new URL(req.url).pathname.split('/').pop()!;
  if (req.method === 'PATCH') {
    const patch = validateSessionPatch(await req.json());
    if (!patch) return Response.json({ error: 'Invalid request body' }, { status: 400 });
    await useCases.updateSession({ id, patch });
    return Response.json({ ok: true });
  }
  if (req.method === 'DELETE') {
    await useCases.deleteSession(id);
    return new Response(null, { status: 204 });
  }
  return new Response('Method Not Allowed', { status: 405 });
});

export default handler;
export { handler as PATCH, handler as DELETE, handler as OPTIONS };
