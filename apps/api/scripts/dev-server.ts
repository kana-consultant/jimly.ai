import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';

// Must load env BEFORE importing route handlers (env.ts calls schema.parse at module init)
for (const path of ['.env.local', '.vercel/.env.development.local']) {
  try { (process as NodeJS.Process & { loadEnvFile(p: string): void }).loadEnvFile(path); } catch {}
}

type Handler = (req: Request) => Promise<Response>;

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1:3001');
  const headers = new Headers(req.headers as Record<string, string>);
  const body = ['GET', 'HEAD'].includes(req.method ?? '') ? undefined : await readBody(req);
  return new Request(url, { method: req.method, headers, body });
}

async function sendResponse(webRes: Response, res: ServerResponse): Promise<void> {
  res.statusCode = webRes.status;
  webRes.headers.forEach((v, k) => res.setHeader(k, v));
  res.flushHeaders();
  if (webRes.body) {
    const reader = webRes.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }
  res.end();
}

const [auth, chat, sessions, session, sessionMsgs] = (await Promise.all([
  import('../routes/auth/handler.ts'),
  import('../routes/chat.ts'),
  import('../routes/sessions/index.ts'),
  import('../routes/sessions/[id].ts'),
  import('../routes/sessions/[id]/messages.ts'),
])) as Record<string, Handler>[];

const routes: Array<{ match: (p: string) => boolean; mod: Record<string, Handler> }> = [
  { match: (p) => p.startsWith('/api/auth'), mod: auth! },
  { match: (p) => p === '/api/chat', mod: chat! },
  { match: (p) => p === '/api/sessions', mod: sessions! },
  { match: (p) => /^\/api\/sessions\/[^/]+$/.test(p), mod: session! },
  { match: (p) => /^\/api\/sessions\/[^/]+\/messages$/.test(p), mod: sessionMsgs! },
];

createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const webReq = await toWebRequest(req);
    const { pathname } = new URL(webReq.url);
    const method = webReq.method?.toUpperCase() ?? 'GET';

    const route = routes.find((r) => r.match(pathname));
    if (!route) { res.statusCode = 404; return void res.end('Not found'); }

    const handler = route.mod[method];
    if (!handler) { res.statusCode = 405; return void res.end('Method not allowed'); }

    const webRes = await handler(webReq);
    if (webRes.status >= 400) {
      const body = await webRes.clone().text();
      console.error(`[dev] ${method} ${pathname} → ${webRes.status}`, body);
    }
    await sendResponse(webRes, res);
  } catch (err) {
    console.error('[dev-server]', err);
    if (!res.headersSent) { res.statusCode = 500; res.end('Error'); }
  }
}).listen(3001, '127.0.0.1', () => console.log('> Ready! Available at http://127.0.0.1:3001'));
