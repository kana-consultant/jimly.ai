import type { IncomingMessage } from 'node:http';
import { auth } from '#/infrastructure/auth/better-auth';
import { createAuthRateLimiter } from '#/infrastructure/ratelimit/upstash';
import { preflightResponse, withCors } from '#/presentation/http/cors';
import { env } from '#/infrastructure/config/env';

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

async function toWebRequest(req: Request): Promise<Request> {
  const base = env.BETTER_AUTH_URL;
  if (typeof (req as unknown as { clone?: unknown }).clone === 'function') {
    // Rewrite host to BETTER_AUTH_URL so better-auth's URL-based router matches,
    // even when the request arrives via a reverse proxy with a different host header.
    const url = new URL(req.url);
    const baseUrl = new URL(base);
    if (url.origin === baseUrl.origin) return req;
    const normalized = new URL(url.pathname + url.search, base);
    return new Request(normalized, req as unknown as RequestInit);
  }
  const url = new URL(req.url, base);
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const headers = req.headers instanceof Headers ? req.headers : new Headers(req.headers as HeadersInit);
  return new Request(url, {
    method: req.method,
    headers,
    body: hasBody ? new Uint8Array(await readBody(req as unknown as IncomingMessage)) : undefined,
  });
}

async function handler(rawReq: Request): Promise<Response> {
  const origin = header(rawReq, 'origin');
  if (rawReq.method === 'OPTIONS') return preflightResponse(origin);

  const limit = await rateLimiter.check(clientIp(rawReq));
  if (!limit.ok) {
    return withCors(
      origin,
      JSON.stringify({ error: 'Too many requests' }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const webReq = await toWebRequest(rawReq);
  const authRes = await auth.handler(webReq);
  return withCors(origin, authRes.body, { status: authRes.status, headers: authRes.headers });
}

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE, handler as OPTIONS };
