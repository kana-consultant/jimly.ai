import { execSync } from 'node:child_process';
import { cpSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: root });
}

// Vercel Build Output API requires each Node.js function to export a
// Node.js http (req, res) handler. The API routes use Web API (Request/Response),
// so this adapter bridges the two. It is written into each .func/index.js.
const ADAPTER = `'use strict';
const mod = require('./bundle.cjs');
const webHandler = typeof mod.default === 'function' ? mod.default : mod;

module.exports = async function handler(nodeReq, nodeRes) {
  const proto = nodeReq.headers['x-forwarded-proto'] ?? 'https';
  const host = nodeReq.headers['x-forwarded-host'] ?? nodeReq.headers.host ?? 'localhost';
  const url = new URL(nodeReq.url, proto + '://' + host);

  const headers = new Headers();
  for (const [k, v] of Object.entries(nodeReq.headers)) {
    if (v == null) continue;
    if (Array.isArray(v)) v.forEach(x => headers.append(k, x));
    else headers.set(k, v);
  }

  let body = null;
  if (nodeReq.method !== 'GET' && nodeReq.method !== 'HEAD') {
    const chunks = [];
    for await (const chunk of nodeReq) chunks.push(chunk);
    body = Buffer.concat(chunks);
  }

  const request = new Request(url.toString(), { method: nodeReq.method, headers, body });
  const response = await webHandler(request);

  nodeRes.statusCode = response.status;
  response.headers.forEach((v, k) => nodeRes.setHeader(k, v));
  nodeRes.flushHeaders();

  if (response.body) {
    const reader = response.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      // ponytail: drain check prevents backpressure drops on SSE streams
      if (!nodeRes.write(value)) await new Promise(r => nodeRes.once('drain', r));
    }
  }
  nodeRes.end();
};
`;

const VC_CONFIG = JSON.stringify(
  { runtime: 'nodejs22.x', handler: 'index.js', launcherType: 'Nodejs' },
  null,
  2,
);

const ROUTES = [
  { src: 'apps/api/routes/chat.ts',                     dest: 'api/chat' },
  { src: 'apps/api/routes/sessions/index.ts',           dest: 'api/sessions/index' },
  { src: 'apps/api/routes/sessions/[id].ts',            dest: 'api/sessions/[id]' },
  { src: 'apps/api/routes/sessions/[id]/messages.ts',   dest: 'api/sessions/[id]/messages' },
  { src: 'apps/api/routes/auth/handler.ts',             dest: 'api/auth/handler' },
];

// ── 1. Clean ──────────────────────────────────────────────────────────────────
rmSync(resolve(root, '.vercel/output'), { recursive: true, force: true });
mkdirSync(resolve(root, '.vercel/output/static'), { recursive: true });
mkdirSync(resolve(root, '.vercel/output/functions'), { recursive: true });

// ── 2. Build apps ─────────────────────────────────────────────────────────────
run('pnpm --filter landing build');
run('pnpm --filter backoffice build');

// ── 3. Copy static outputs ────────────────────────────────────────────────────
// Landing → root
cpSync(resolve(root, 'apps/landing/dist'), resolve(root, '.vercel/output/static'), { recursive: true });
// Backoffice → /app (vite base: '/app' already prefixes asset paths in HTML)
mkdirSync(resolve(root, '.vercel/output/static/app'), { recursive: true });
cpSync(resolve(root, 'apps/backoffice/dist'), resolve(root, '.vercel/output/static/app'), { recursive: true });

// ── 4. Compile API routes ─────────────────────────────────────────────────────
for (const { src, dest } of ROUTES) {
  const funcDir = resolve(root, '.vercel/output/functions', `${dest}.func`);
  mkdirSync(funcDir, { recursive: true });

  // esbuild resolves #/* via apps/api/package.json "imports" field (Node subpath imports)
  // and also via apps/api/tsconfig.json "paths" as fallback.
  await build({
    entryPoints: [resolve(root, src)],
    bundle: true,
    platform: 'node',
    target: 'node22',
    tsconfig: resolve(root, 'apps/api/tsconfig.json'),
    format: 'cjs',
    outfile: resolve(funcDir, 'bundle.cjs'),
  });

  writeFileSync(resolve(funcDir, 'index.js'), ADAPTER);
  writeFileSync(resolve(funcDir, '.vc-config.json'), VC_CONFIG);
}

// ── 5. Write routing config ───────────────────────────────────────────────────
const config = {
  version: 3,
  routes: [
    // API functions — matched before filesystem check
    { src: '/api/auth/(.+)',                       dest: '/api/auth/handler' },
    { src: '/api/sessions/([^/]+)/messages',       dest: '/api/sessions/[id]/messages' },
    { src: '/api/sessions/([^/]+)',                dest: '/api/sessions/[id]' },
    { src: '/api/sessions',                        dest: '/api/sessions/index' },
    { src: '/api/chat',                            dest: '/api/chat' },
    // Static filesystem (landing, backoffice assets)
    { handle: 'filesystem' },
    // SPA fallback: redirect /app → /app/ then serve index.html for all /app/* paths
    { src: '/app$', headers: { Location: '/app/' }, status: 301 },
    { src: '/app/(.*)',                            dest: '/app/index.html' },
  ],
};
writeFileSync(resolve(root, '.vercel/output/config.json'), JSON.stringify(config, null, 2));

console.log('✓ .vercel/output ready');
