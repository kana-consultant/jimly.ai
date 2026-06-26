import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { Readable } from 'node:stream';

// ponytail: `vercel dev`'s catch-all api routing 404s on 2+ path segments for
// standalone @vercel/node functions (vercel/vercel#7435, still open). Running
// the handlers in-process here sidesteps it. Use `pnpm dev` for local work;
// fall back to `vercel dev` only to sanity-check prod routing before deploy.
function devApiPlugin(): Plugin {
  const routes: [RegExp, string][] = [
    [/^\/api\/chat$/, 'api/chat.ts'],
    [/^\/api\/auth\/.*$/, 'api/auth/[...all].ts'],
    [/^\/api\/sessions$/, 'api/sessions/index.ts'],
    [/^\/api\/sessions\/[^/]+$/, 'api/sessions/[id].ts'],
    [/^\/api\/sessions\/[^/]+\/messages$/, 'api/sessions/[id]/messages.ts'],
  ];

  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = (req.url ?? '').split('?')[0];
        const route = routes.find(([re]) => re.test(pathname));
        if (!route) return next();

        try {
          const modPath = path.resolve(__dirname, route[1]).split(path.sep).join('/');
          const mod = await server.ssrLoadModule(modPath);

          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);

          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
          }

          const hasBody = chunks.length > 0 && req.method !== 'GET' && req.method !== 'HEAD';
          const request = new Request(`http://${req.headers.host}${req.url}`, {
            method: req.method,
            headers,
            body: hasBody ? Buffer.concat(chunks) : undefined,
          });

          const response: Response = await mod.default(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          if (response.body) Readable.fromWeb(response.body as never).pipe(res);
          else res.end();
        } catch (err) {
          console.error('[dev-api]', err);
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // api/*.ts handlers read process.env directly (DATABASE_URL, BETTER_AUTH_*, ...);
  // Vite only exposes VITE_-prefixed vars by default, so load the rest ourselves.
  // .env lives at repo root, shared with the landing app.
  const envDir = path.resolve(__dirname, '../..');
  Object.assign(process.env, loadEnv(mode, envDir, ''));

  return {
    plugins: [react(), tailwindcss(), devApiPlugin()],
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    envDir,
    server: { port: Number(process.env.PORT) || 5173 },
  };
});
