<div align="center">
  <h1>💬 jimly.ai</h1>
  <p>moon monorepo — static Astro landing page + React/Vite backoffice (auth + streaming chat) on Neon + Vercel.</p>

  <img src="https://img.shields.io/badge/moon-8A2BE2?style=for-the-badge" alt="moon" />
  <img src="https://img.shields.io/badge/Astro-BC52EE?style=for-the-badge&logo=astro&logoColor=white" alt="Astro" />
  <img src="https://img.shields.io/badge/React_19-black?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Neon-00E599?style=for-the-badge&logo=postgresql&logoColor=white" alt="Neon" />
  <img src="https://img.shields.io/badge/Drizzle-C5F74F?style=for-the-badge" alt="Drizzle" />
  <img src="https://img.shields.io/badge/Better_Auth-black?style=for-the-badge" alt="Better Auth" />
  <img src="https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</div>

---

## Layout

Two deployable apps, each its own Vercel project:

```text
apps/
  landing/      Astro, output: 'static' — marketing site only, no DB/auth/API
  backoffice/   Vite + React + react-router SPA — auth (login/register) + chat
    api/          Vercel functions: Better Auth handler, sessions/messages CRUD, chat stream
    src/db/       Drizzle schema (chat + Better Auth tables)
    src/auth/     Better Auth server config + React client
    src/services/ NeonChatRepository, Perfect10 AI agent client
    src/features/ chat + auth feature modules (components + logic)
```

Landing's "Login" link points at the backoffice's deployed URL (`PUBLIC_BACKOFFICE_URL`). The browser never talks to Neon directly — the backoffice SPA calls its own `api/*` functions, which use Drizzle.

## ✨ Features

- Email/password sign-in (Better Auth, Drizzle adapter on Neon)
- Streaming chat with markdown rendering (`react-markdown` + `remark-gfm`)
- Collapsible sidebar — rename / pin chats
- Per-user rate limiting on the chat endpoint (Upstash)
- Mobile-first centered layout, scroll-fade navbar

## 🛠️ Tech Stack

| Category | Technology |
| --- | --- |
| **Monorepo** | moon, pnpm workspaces |
| **Landing** | Astro 6 (static output) |
| **Backoffice** | Vite 6, React 19, react-router 7 |
| **UI** | shadcn/ui, Radix (`@base-ui/react`), `@kana-consultant/ui-kit`, `lucide-react` |
| **Styling** | Tailwind CSS 4, Framer Motion |
| **State** | Zustand |
| **DB** | Neon Postgres + Drizzle ORM (`@neondatabase/serverless`) |
| **Auth** | Better Auth (email/password + Google) |
| **Hosting** | Vercel (static + serverless functions) |

## 🚀 Run locally

Requires Node >= 22.12.0, pnpm.

```bash
pnpm install
cp .env.example .env   # repo root — shared by both apps
```

Fill in `.env` 

- Landing → http://localhost:4321
```bash
cd apps/landing
pnpm dev 
```

- Backoffice → http://localhost:3000
```bash
cd apps/backoffice
pnpm dev 
```

cd apps/backoffice:

| Command | Description |
| --- | --- |
| `pnpm dev` / `moon run :dev` | Run every app's dev task |
| `pnpm build` / `moon run :build` | Build every app |
| `pnpm --filter landing dev` | Landing dev server (Astro) only |
| `pnpm --filter backoffice dev` | Backoffice SPA only (Vite, no API) |
| `cd apps/backoffice && npx vercel dev` | Backoffice SPA + `api/*` functions together (auth/chat need this) |
| `pnpm --filter backoffice db:push` | Push Drizzle schema to Neon |
| `pnpm --filter backoffice test` | Run repository tests (vitest) |

## Environment variables

One `.env` at the repo root, shared by both apps (see `.env.example`):

## Deploy

Two Vercel projects, each with **Root Directory** set to its app dir (`apps/landing`, `apps/backoffice`):

- **landing** — static build, no adapter needed, output `dist`.
- **backoffice** — Vite build, `api/` auto-detected as serverless functions (Node runtime — Better Auth's Drizzle adapter is not Edge-compatible). Enable the Neon-Vercel integration for `DATABASE_URL` + per-preview branches.

