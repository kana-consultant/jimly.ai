import { env } from '#/infrastructure/config/env';

function isAllowedOrigin(origin: string | null): origin is string {
  if (!origin) return false;
  if (env.WEB_ORIGIN) return origin === env.WEB_ORIGIN;
  return /^https?:\/\/localhost(:\d+)?$/.test(origin);
}

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
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
  });
}

const STRIPPED_HEADERS = ['content-length', 'content-encoding', 'transfer-encoding', 'connection'];

export function withCors(origin: string | null, body: BodyInit | null, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  for (const name of STRIPPED_HEADERS) headers.delete(name);
  for (const [key, value] of Object.entries(corsHeaders(origin))) headers.set(key, value);
  return new Response(body, { ...init, headers });
}
