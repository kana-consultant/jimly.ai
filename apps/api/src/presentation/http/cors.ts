import { env } from '#/infrastructure/config/env';

function isAllowedOrigin(origin: string | null): origin is string {
  return origin !== null && origin === env.WEB_ORIGIN;
}

// Echoes the exact allowed origin (never `*`) so credentialed cross-origin
// requests from the frontend are accepted (security fix #6 / cross-origin auth).
export function corsHeaders(origin: string | null): HeadersInit {
  if (!isAllowedOrigin(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };
}

export function preflightResponse(origin: string | null): Response {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(origin),
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Takes body + init directly (not an existing Response) so we never re-pipe
// another Response's `.body` stream into a new one — doing so left the
// Vercel dev Node adapter hanging indefinitely on the response write.
// Drop hop-by-hop / framing headers from the upstream response. They describe
// the *original* body stream; reusing them on a reconstructed Response with a
// different byte length makes Vercel's Node dev adapter write a stale
// Content-Length, so the client waits forever for bytes that never arrive.
const STRIPPED_HEADERS = ['content-length', 'content-encoding', 'transfer-encoding', 'connection'];

export function withCors(origin: string | null, body: BodyInit | null, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  for (const name of STRIPPED_HEADERS) headers.delete(name);
  for (const [key, value] of Object.entries(corsHeaders(origin))) headers.set(key, value);
  return new Response(body, { ...init, headers });
}
