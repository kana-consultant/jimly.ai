import type { IncomingMessage } from 'node:http';
import { auth } from '#/infrastructure/auth/better-auth';
import { createAuthRateLimiter } from '#/infrastructure/ratelimit/upstash';
import { preflightResponse, withCors } from '#/presentation/http/cors';

export const config = { runtime: 'nodejs' };

const rateLimiter = createAuthRateLimiter();

function header(req: Request, name: string): string | null {
  if (req.headers instanceof Headers) return req.headers.get(name);
  const raw = (req.headers as unknown as Record<string, string | string[] | undefined>)[name.toLowerCase()];
  return Array.isArray(raw) ? raw.join(', ') : raw ?? null;
}

function clientIp(req: Request): string {
  return header(req, 'x-forwarded-for')?.split(',')[0]?.trim() || header(req, 'x-real-ip') || 'unknown';
}

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// vercel dev sometimes hands this catch-all route a raw Node IncomingMessage
// (relative `.url`, body as a 'data'/'end' stream, no `.clone`/`.arrayBuffer`)
// instead of a spec Request, breaking better-auth's internal `new URL(req.url)`
// and `request.clone()`. Build a real Request from it when that happens.
async function toWebRequest(req: Request): Promise<Request> {
  if (typeof (req as unknown as { clone?: unknown }).clone === 'function') return req;
  const host = header(req, 'host') ?? 'localhost';
  const url = new URL(req.url, `http://${host}`);
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const headers = req.headers instanceof Headers ? req.headers : new Headers(req.headers as HeadersInit);
  return new Request(url, {
    method: req.method,
    headers,
    body: hasBody ? new Uint8Array(await readBody(req as unknown as IncomingMessage)) : undefined,
  });
}

// @vercel/node's dev server only recognizes Web-style Request->Response
// handlers via named HTTP-method exports (or `fetch`); a bare default export
// falls through to the legacy Node (req,res) path and hangs forever since we
// never call res.end(). Export every method this catch-all needs to handle.
async function handler(rawReq: Request): Promise<Response> {
  console.log('[auth] hit', rawReq.method, rawReq.url);
  const origin = header(rawReq, 'origin');
  console.log('[auth] origin', origin);
  if (rawReq.method === 'OPTIONS') return preflightResponse(origin);

  const limit = await rateLimiter.check(clientIp(rawReq));
  console.log('[auth] rateLimit', limit);
  if (!limit.ok) {
    return withCors(
      origin,
      JSON.stringify({ error: 'Too many requests' }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const webReq = await toWebRequest(rawReq);
  console.log('[auth] webReq', webReq.method, webReq.url);
  const authRes = await auth.handler(webReq);
  const bodyText = await authRes.text();
  console.log('[auth] result', authRes.status, bodyText);
  return withCors(origin, bodyText, { status: authRes.status, headers: authRes.headers });
}

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE, handler as OPTIONS };
