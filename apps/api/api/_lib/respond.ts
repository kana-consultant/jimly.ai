import { AppError } from '#/application/shared/errors';

// Single AppError -> HTTP mapping source. 5xx (upstream/unexpected failures)
// get logged here so they aren't silently swallowed (security fix #5).
export async function respond(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof AppError) {
      if (e.status >= 500) console.error(`[api] ${e.code} (${e.status}): ${e.message}`);
      return Response.json({ error: e.message }, { status: e.status });
    }
    console.error('[api] unexpected error:', e);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
