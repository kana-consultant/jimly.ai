import { withUser } from '#/presentation/http/with-user';
import { validateSessionPatch } from '#/presentation/http/validate';
import { badRequest } from '#/presentation/http/respond';

export const config = { runtime: 'nodejs' };

const handler = withUser(async ({ req, useCases }) => {
  const id = new URL(req.url).pathname.split('/').pop()!;
  if (req.method === 'PATCH') {
    const patch = validateSessionPatch(await req.json());
    if (!patch) return badRequest();
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
