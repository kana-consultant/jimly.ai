import { withUser } from '../_lib/with-user';
import { validateSessionPatch } from '../_lib/validate';

export const config = { runtime: 'edge' };

export default withUser(async ({ req, repo }) => {
  const id = new URL(req.url).pathname.split('/').pop()!;
  if (req.method === 'PATCH') {
    const patch = validateSessionPatch(await req.json());
    if (!patch) return Response.json({ error: 'Invalid request body' }, { status: 400 });
    await repo.updateSession(id, patch);
    return Response.json({ ok: true });
  }
  if (req.method === 'DELETE') {
    await repo.deleteSession(id);
    return new Response(null, { status: 204 });
  }
  return new Response('Method Not Allowed', { status: 405 });
});
