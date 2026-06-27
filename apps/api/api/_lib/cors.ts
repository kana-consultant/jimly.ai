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

export function withCors(origin: string | null, res: Response): Response {
  const headers = new Headers(res.headers);
  for (const [key, value] of Object.entries(corsHeaders(origin))) headers.set(key, value);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}
