<div align="center">
  <h1>💬 jimly.ai</h1>
  <p>AI chat app — Astro SSR frontend, Supabase auth, streaming chat UI.</p>

  <img src="https://img.shields.io/badge/Astro-BC52EE?style=for-the-badge&logo=astro&logoColor=white" alt="Astro" />
  <img src="https://img.shields.io/badge/React_19-black?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Zustand-orange?style=for-the-badge" alt="Zustand" />
</div>

---

## ✨ Features

- Email + Google sign-in (Supabase Auth)
- Streaming chat with markdown rendering (`react-markdown` + `remark-gfm`)
- Collapsible sidebar — rename / pin chats
- Mobile-first centered layout, scroll-fade navbar

## 🛠️ Tech Stack

| Category | Technology |
| --- | --- |
| **Framework** | Astro 6 (SSR, `@astrojs/node`) |
| **UI** | React 19, shadcn/ui, Radix (`@base-ui/react`), `lucide-react` |
| **Styling** | Tailwind CSS 4, Framer Motion |
| **State** | Zustand |
| **Backend** | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) |

## 🚀 Quick Start

```bash
pnpm install
cp .env.example .env   # fill in Supabase keys etc.
pnpm dev
```

Requires Node >= 22.12.0, pnpm.

| Command | Description |
| --- | --- |
| `pnpm dev` | Start dev server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm astro ...` | Run Astro CLI |

<details>
<summary><b>📂 Folder Structure</b></summary>

```text
src/
  components/   shared UI components
  features/     feature modules (auth, chat)
  hooks/        React hooks
  lib/          utilities
  middleware/   Astro middleware
  pages/        routes (api, chat, login, register)
  services/     external service clients
  stores/       Zustand stores
  styles/       global styles
  types/        shared TS types
```

</details>
