import { withUser } from '../_lib/with-user';
import { validateSessionPatch } from '../_lib/validate';

export const config = { runtime: 'edge' };

export default withUser(async ({ req, useCases }) => {
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
