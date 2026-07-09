import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import authHandler from './routes/auth/handler.ts';
import chatHandler from './routes/chat.ts';
import sessionsHandler from './routes/sessions/index.ts';
import sessionIdHandler from './routes/sessions/[id].ts';
import messagesHandler from './routes/sessions/[id]/messages.ts';
import feedbackHandler from './routes/sessions/[id]/messages/[msgId]/feedback.ts';

type Handler = (req: Request) => Promise<Response>;

const routes: Array<{ test: (url: string) => boolean; handler: Handler }> = [
  { test: (u) => u.startsWith('/api/auth/'), handler: authHandler },
  { test: (u) => /^\/api\/sessions\/[^/]+\/messages\/[^/]+\/feedback/.test(u), handler: feedbackHandler },
  { test: (u) => /^\/api\/sessions\/[^/]+\/messages/.test(u), handler: messagesHandler },
  { test: (u) => /^\/api\/sessions\/[^/]+/.test(u), handler: sessionIdHandler },
  { test: (u) => u === '/api/sessions' || u.startsWith('/api/sessions?'), handler: sessionsHandler },
  { test: (u) => u.startsWith('/api/chat'), handler: chatHandler },
];

const PORT = 3001;
const BASE = `http://localhost:${PORT}`;

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const url = new URL(req.url ?? '/', BASE);
  const headers = new Headers(req.headers as Record<string, string>);
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  let body: Buffer | undefined;
  if (hasBody) {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    body = Buffer.concat(chunks);
  }
  return new Request(url, { method: req.method, headers, body });
}

async function sendWebResponse(webRes: Response, res: ServerResponse) {
  res.statusCode = webRes.status;
  webRes.headers.forEach((v, k) => res.setHeader(k, v));
  res.end(Buffer.from(await webRes.arrayBuffer()));
}

const server = createServer(async (req, res) => {
  const url = req.url ?? '/';
  const route = routes.find((r) => r.test(url));
  if (!route) { res.statusCode = 404; res.end('Not Found'); return; }
  try {
    const webReq = await toWebRequest(req);
    const webRes = await route.handler(webReq);
    await sendWebResponse(webRes, res);
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => console.log(`API ready at http://localhost:${PORT}`));
