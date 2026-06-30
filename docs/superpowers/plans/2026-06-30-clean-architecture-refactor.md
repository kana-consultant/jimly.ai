# jimly.ai Clean Architecture Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 8 architecture and maintainability issues (A1–A8) in the jimly.ai monorepo without changing any product behavior.

**Architecture:** Backoffice is a React SPA (TanStack Store, react-router). API uses hexagonal architecture (domain/application/infrastructure/presentation/routes) on Vercel Node functions. Critical issues C1–C3 are already resolved in commit `9bf1987`. This plan addresses the remaining architecture issues only.

**Tech Stack:** React 18, TanStack Store, TypeScript, Vercel Node functions, Drizzle/Neon, pnpm workspaces, moon monorepo.

---

## File Map

### Modified
| File | Tasks |
|---|---|
| `apps/backoffice/src/features/chat/logic/use-chat-sessions.ts` | A1a, A7 |
| `apps/backoffice/src/features/chat/components/chat-thread.tsx` | A1b, A8 |
| `apps/backoffice/src/features/chat/logic/chat-repository-context.tsx` | A2 |
| `apps/backoffice/src/services/chat-repository.ts` | A5 |
| `apps/backoffice/src/features/chat/logic/chat-api-client.ts` | A3, A4, A6 |
| `apps/backoffice/src/features/chat/logic/use-chat-stream.ts` | A3, A6 |
| `apps/backoffice/src/features/chat/logic/use-send-message.ts` | A3, A6 |
| `apps/backoffice/src/features/chat/components/chat-list.tsx` | A8 |
| `apps/backoffice/src/features/chat/components/chat-topic-nav.tsx` | A8 |
| `apps/api/src/infrastructure/ai/perfect10-gateway.ts` | A4 |
| `apps/api/src/application/chat/send-message.ts` | A4 |
| `apps/api/src/presentation/http/validate.ts` | A3 |

### Created
| File | Purpose |
|---|---|
| `apps/api/src/infrastructure/ai/sse-codec.ts` | Server SSE encode/decode primitives |
| `apps/backoffice/src/features/chat/logic/sse-codec.ts` | Client SSE decode primitive |

---

## Task 1: A1a — Move session fetch into useEffect

**Problem:** `use-chat-sessions.ts` fires a fetch during the render body via a module-level flag. This is Strict Mode hostile (double-invoke skips the fetch), never re-fetches after remount, and breaks with multiple mounted instances.

**Files:**
- Modify: `apps/backoffice/src/features/chat/logic/use-chat-sessions.ts`

- [ ] **Step 1: Replace module-level flag + render-body fetch with useEffect**

Replace the full file:

```ts
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useChatStore } from '@/features/chat/logic/chat-store';
import { chatRepository } from '@/features/chat/logic/chat-repository-instance';

export function useChatSessions() {
  const sessions = useChatStore((state) => state.sessions);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const setSessions = useChatStore((state) => state.setSessions);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const setMessages = useChatStore((state) => state.setMessages);
  const removeSession = useChatStore((state) => state.removeSession);
  const togglePinSession = useChatStore((state) => state.togglePinSession);
  const renameSession = useChatStore((state) => state.renameSession);

  useEffect(() => {
    chatRepository.listSessions().then(setSessions);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // setSessions is a stable TanStack Store action — safe to omit from deps

  async function selectChat(chatId: string) {
    setActiveChat(chatId);
    const messages = await chatRepository.listMessages(chatId);
    setMessages(chatId, messages);
  }

  function newChat() {
    setActiveChat(null);
  }

  async function deleteChat(chatId: string) {
    try {
      await chatRepository.deleteSession(chatId);
      removeSession(chatId);
      if (activeChatId === chatId) setActiveChat(null);
      toast.success('Chat deleted');
    } catch {
      toast.error('Failed to delete chat');
    }
  }

  async function togglePin(chatId: string) {
    const session = sessions.find((s) => s.id === chatId);
    if (!session) return;
    togglePinSession(chatId);
    await chatRepository.updateSession(chatId, { pinned: !session.pinned });
  }

  async function renameChat(chatId: string, title: string) {
    try {
      renameSession(chatId, title);
      await chatRepository.updateSession(chatId, { title });
      toast.success('Chat renamed');
    } catch {
      toast.error('Failed to rename chat');
    }
  }

  return { sessions, activeChatId, selectChat, newChat, deleteChat, togglePin, renameChat };
}
```

- [ ] **Step 2: Build**

```bash
cd apps/backoffice && pnpm build
```

Expected: exits 0, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add apps/backoffice/src/features/chat/logic/use-chat-sessions.ts
git commit -m "fix(backoffice): move session fetch into useEffect (A1a)"
```

---

## Task 2: A1b — Move scroll logic into useEffect + useRef

**Problem:** `chat-thread.tsx` calls `requestAnimationFrame(...)` directly in the render body (fires every render), and uses module-level `scrollEl`/`prevLen` that leak across mounted instances and break Strict Mode.

**Files:**
- Modify: `apps/backoffice/src/features/chat/components/chat-thread.tsx`

- [ ] **Step 1: Remove module-level scroll state**

Delete these three declarations at the top of `chat-thread.tsx` (after the `INTENT_TOPICS` block):

```ts
// DELETE these:
let scrollEl: HTMLDivElement | null = null;
let prevLen = 0;

// DELETE this function:
function scrollToBottom(behavior: ScrollBehavior = 'auto') {
  const container = scrollEl;
  if (container) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }
}
```

- [ ] **Step 2: Add useRef and useEffect imports**

The existing React import line at the top of the file currently reads (it may already import some hooks — adjust accordingly):

```tsx
import { useEffect, useRef } from 'react';
```

- [ ] **Step 3: Add refs and effects inside ChatThread()**

Add these immediately after the existing store/hook calls (after `const topics = deriveTopics(...)` — topics line will be memoized in Task 8, leave it for now):

```tsx
const scrollRef = useRef<HTMLDivElement>(null);
const prevLenRef = useRef(0);

// Scroll to bottom when a new message arrives
useEffect(() => {
  const container = scrollRef.current;
  if (!container) return;
  if (messages.length > prevLenRef.current) {
    container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });
  }
  prevLenRef.current = messages.length;
  if (!hasMessages && showSuggestionsStore.state) {
    showSuggestionsStore.setState(() => false);
  }
}, [messages.length, hasMessages]);

// Keep scroll pinned to bottom while streaming
useEffect(() => {
  if (!isStreaming || !hasMessages || !lastMessage?.content) return;
  const container = scrollRef.current;
  if (!container) return;
  const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= 150;
  if (isNearBottom) container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });
}, [isStreaming, hasMessages, lastMessage?.content]);
```

- [ ] **Step 4: Delete the requestAnimationFrame block in the render body**

Remove the entire `requestAnimationFrame(() => { ... });` call that currently sits between `const topics = deriveTopics(...)` and `function handleTopicSelect(...)`.

- [ ] **Step 5: Change the scroll container ref**

Find the scroll container div (currently has `ref={(el) => { scrollEl = el; }}`). Change it to:

```tsx
<div
  ref={scrollRef}
  className={cn(
    'flex-1 overflow-y-auto relative',
    hasMessages ? 'pb-52' : '',
  )}
>
```

- [ ] **Step 6: Build**

```bash
cd apps/backoffice && pnpm build
```

Expected: exits 0, no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add apps/backoffice/src/features/chat/components/chat-thread.tsx
git commit -m "fix(backoffice): move scroll logic into useEffect/useRef (A1b)"
```

---

## Task 3: A2 — Real React context for ChatRepository DI

**Problem:** `chat-repository-context.tsx` uses a mutable module-level variable (`let activeRepository`) assigned during render. This is not real React context — it's SSR-unsafe, breaks concurrent rendering, and makes tests non-deterministic when mounting with a custom `value` prop.

**Files:**
- Modify: `apps/backoffice/src/features/chat/logic/chat-repository-context.tsx`

- [ ] **Step 1: Replace mutable global with createContext/useContext**

Replace the full file:

```tsx
import { createContext, useContext, type ReactNode } from 'react';
import type { ChatRepository } from '@/services/chat-repository';
import { chatRepository } from '@/features/chat/logic/chat-repository-instance';

const ChatRepositoryContext = createContext<ChatRepository>(chatRepository);

export function ChatRepositoryProvider({
  value = chatRepository,
  children,
}: {
  value?: ChatRepository;
  children: ReactNode;
}) {
  return <ChatRepositoryContext.Provider value={value}>{children}</ChatRepositoryContext.Provider>;
}

export function useChatRepository(): ChatRepository {
  return useContext(ChatRepositoryContext);
}
```

- [ ] **Step 2: Build**

```bash
cd apps/backoffice && pnpm build
```

Expected: exits 0. Public API (`ChatRepositoryProvider`, `useChatRepository`) is unchanged — no callers need updating.

- [ ] **Step 3: Commit**

```bash
git add apps/backoffice/src/features/chat/logic/chat-repository-context.tsx
git commit -m "fix(backoffice): replace mutable global with real React context (A2)"
```

---

## Task 4: A5 — Split ChatRepository interface (Interface Segregation)

**Problem:** `apps/backoffice/src/services/chat-repository.ts` exposes `getPerfect10SessionId` and `setPerfect10SessionId`, which are server-internal methods. The browser implementation stubs these as no-ops; clients shouldn't implement server-internal contracts.

**Files:**
- Modify: `apps/backoffice/src/services/chat-repository.ts`

- [ ] **Step 1: Remove server-only methods from the client interface**

Replace the full file:

```ts
import type { ChatMessage, ChatSession, NewChatSession } from '../types/chat';

export interface ChatRepository {
  listSessions(): Promise<ChatSession[]>;
  createSession(session: NewChatSession): Promise<void>;
  updateSession(id: string, patch: { updatedAt?: string; pinned?: boolean; title?: string }): Promise<void>;
  deleteSession(id: string): Promise<void>;
  listMessages(sessionId: string): Promise<ChatMessage[]>;
  addMessage(message: ChatMessage): Promise<void>;
}
```

The API-side `ChatRepository` at `apps/api/src/domain/chat/chat-repository.ts` retains `getPerfect10SessionId`/`setPerfect10SessionId` — **do not touch that file**.

- [ ] **Step 2: Verify the browser implementation matches**

Find the concrete class/object that implements the client `ChatRepository`:

```bash
grep -r "ChatRepository" apps/backoffice/src --include="*.ts" --include="*.tsx" -l
```

Open each file and confirm it only implements the 6 methods above (no Perfect10 methods). If any file implements the removed methods, delete those method implementations.

- [ ] **Step 3: Build**

```bash
cd apps/backoffice && pnpm build
```

Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add apps/backoffice/src/services/chat-repository.ts
git commit -m "fix(backoffice): drop server-only methods from client ChatRepository (A5)"
```

---

## Task 5: A4 — Shared SSE codec

**Problem:** The `data:`/`[DONE]`/`{choices:[{delta:{content}}]}` SSE wire format is parsed and serialized independently in three places: `perfect10-gateway.ts` (encode), `send-message.ts` (decode to accumulate text), and `chat-api-client.ts` (decode per chunk). One format change breaks all three.

**Files:**
- Create: `apps/api/src/infrastructure/ai/sse-codec.ts`
- Create: `apps/backoffice/src/features/chat/logic/sse-codec.ts`
- Modify: `apps/api/src/infrastructure/ai/perfect10-gateway.ts`
- Modify: `apps/api/src/application/chat/send-message.ts`

Note: `chat-api-client.ts` picks up the client codec in Task 6 (it gets rewritten there anyway).

- [ ] **Step 1: Create server-side SSE codec**

Create `apps/api/src/infrastructure/ai/sse-codec.ts`:

```ts
const _encoder = new TextEncoder();

export function parseDeltaContent(data: string): string | null {
  try {
    const parsed = JSON.parse(data) as { choices?: { delta?: { content?: string } }[] };
    return parsed.choices?.[0]?.delta?.content ?? null;
  } catch {
    return null;
  }
}

export function sseDataLine(json: string): Uint8Array {
  return _encoder.encode(`data: ${json}\n\n`);
}

export function sseDoneLine(): Uint8Array {
  return _encoder.encode('data: [DONE]\n\n');
}

// Pure line splitter — caller owns the TextDecoder (it's stateful for multi-byte chars)
export function splitSseLines(buffer: string, decoded: string): { lines: string[]; remainder: string } {
  const combined = buffer + decoded;
  const parts = combined.split('\n');
  return { lines: parts.slice(0, -1), remainder: parts[parts.length - 1] ?? '' };
}
```

- [ ] **Step 2: Create client-side SSE codec**

Create `apps/backoffice/src/features/chat/logic/sse-codec.ts`:

```ts
export function parseDeltaContent(data: string): string | null {
  try {
    const parsed = JSON.parse(data) as { choices?: { delta?: { content?: string } }[] };
    return parsed.choices?.[0]?.delta?.content ?? null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 3: Update perfect10-gateway.ts to use codec**

Add the import at the top of `apps/api/src/infrastructure/ai/perfect10-gateway.ts`:

```ts
import { sseDataLine, sseDoneLine, splitSseLines } from './sse-codec';
```

Replace the `translateStream` function:

```ts
function translateStream(): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  let buffer = '';

  return new TransformStream({
    transform(chunk, controller) {
      const { lines, remainder } = splitSseLines(buffer, decoder.decode(chunk, { stream: true }));
      buffer = remainder;

      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (!data) continue;
        try {
          const parsed = JSON.parse(data) as { text?: string };
          if (parsed.text) {
            controller.enqueue(
              sseDataLine(JSON.stringify({ choices: [{ delta: { content: parsed.text } }] })),
            );
          }
        } catch {
          // ignore malformed upstream lines
        }
      }
    },
    flush(controller) {
      controller.enqueue(sseDoneLine());
    },
  });
}
```

Remove the old `const decoder = new TextDecoder()` and `const encoder = new TextEncoder()` declarations from inside `translateStream` (they are now handled by the codec and per-call decoder above).

- [ ] **Step 4: Update send-message.ts to use codec**

Add the import at the top of `apps/api/src/application/chat/send-message.ts`:

```ts
import { parseDeltaContent, splitSseLines } from '#/infrastructure/ai/sse-codec';
```

Delete the local `UpstreamDelta` interface. Replace `persistReplyOnComplete`:

```ts
function persistReplyOnComplete(
  upstream: ReadableStream<Uint8Array>,
  onComplete: (fullText: string) => Promise<void>,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  return upstream.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        controller.enqueue(chunk);
        const { lines, remainder } = splitSseLines(buffer, decoder.decode(chunk, { stream: true }));
        buffer = remainder;
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (!data || data === '[DONE]') continue;
          const delta = parseDeltaContent(data);
          if (delta) fullText += delta;
        }
      },
      async flush() {
        if (fullText) await onComplete(fullText);
      },
    }),
  );
}
```

- [ ] **Step 5: Build API app**

```bash
cd apps/api && pnpm build
```

Expected: exits 0, no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/infrastructure/ai/sse-codec.ts
git add apps/backoffice/src/features/chat/logic/sse-codec.ts
git add apps/api/src/infrastructure/ai/perfect10-gateway.ts
git add apps/api/src/application/chat/send-message.ts
git commit -m "refactor: extract SSE codec to shared modules, remove duplicate parsers (A4)"
```

---

## Task 6: A3 + A6 — Slim API payload + AbortController

**Problem A3:** `use-send-message.ts` sends the full message history array on every turn. `validateChatRequest` on the server discards all but the last message's content (Perfect10 owns session state). This is O(n) wasted bandwidth that grows with conversation length.

**Problem A6:** `streamChatCompletion` has no `AbortSignal`. Navigating away or re-sending mid-stream leaks the fetch. The server's `persistReplyOnComplete` flush still fires and persists a partial reply to the database.

**Fix:** Send `{chatId, content}` only. Add `AbortController` in `useSendMessage` — aborted before each new send, signal flows down to `fetch`.

**Files:**
- Modify: `apps/api/src/presentation/http/validate.ts`
- Modify: `apps/backoffice/src/features/chat/logic/chat-api-client.ts`
- Modify: `apps/backoffice/src/features/chat/logic/use-chat-stream.ts`
- Modify: `apps/backoffice/src/features/chat/logic/use-send-message.ts`

- [ ] **Step 1: Simplify validateChatRequest on the API**

In `apps/api/src/presentation/http/validate.ts`, replace `validateChatRequest`:

```ts
/**
 * Validates the body of a POST /api/chat request.
 * Accepts {chatId, content} directly — history array removed.
 * The server is the sole author of conversation history server-side.
 */
export function validateChatRequest(body: unknown): { chatId: string; content: string } | null {
  if (!isRecord(body)) return null;
  const { chatId, content } = body;
  if (!isNonEmptyString(chatId)) return null;
  if (typeof content !== 'string' || content.length === 0 || content.length > MAX_CONTENT_LENGTH) return null;
  return { chatId, content };
}
```

- [ ] **Step 2: Rewrite chat-api-client.ts**

Replace the full file `apps/backoffice/src/features/chat/logic/chat-api-client.ts`:

```ts
import { parseDeltaContent } from './sse-codec';

export async function* streamChatCompletion(
  chatId: string,
  content: string,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, content }),
    signal,
  });

  if (!res.ok || !res.body) throw new Error('Chat stream request failed');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') return;
      const delta = parseDeltaContent(data);
      if (delta) yield delta;
    }
  }
}
```

- [ ] **Step 3: Rewrite use-chat-stream.ts**

Replace the full file `apps/backoffice/src/features/chat/logic/use-chat-stream.ts`:

```ts
import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import { uuid } from '@/lib/uuid';
import { streamChatCompletion } from '@/features/chat/logic/chat-api-client';
import { useChatStore, chatStoreActions } from '@/features/chat/logic/chat-store';
import type { ChatMessage } from '@/types/chat';

const EMPTY_MESSAGES: ChatMessage[] = [];
const errorStore = new Store<string | null>(null);

export async function streamAssistantReply(chatId: string, content: string, signal?: AbortSignal) {
  chatStoreActions.addMessage(chatId, {
    id: uuid(),
    sessionId: chatId,
    role: 'assistant',
    content: '',
    createdAt: new Date().toISOString(),
  });
  chatStoreActions.setStreaming(true);
  errorStore.setState(() => null);
  try {
    for await (const chunk of streamChatCompletion(chatId, content, signal)) {
      chatStoreActions.appendToLastMessage(chatId, chunk);
    }
  } catch (err) {
    chatStoreActions.removeLastMessage(chatId);
    if (!(err instanceof Error && err.name === 'AbortError')) {
      errorStore.setState(() => 'Something went wrong while replying. Please try again.');
    }
  } finally {
    chatStoreActions.setStreaming(false);
  }
}

export function useChatStream() {
  const activeChatId = useChatStore((state) => state.activeChatId);
  const messages = useChatStore((state) => state.messagesByChatId[activeChatId ?? ''] ?? EMPTY_MESSAGES);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const error = useStore(errorStore, (s) => s);

  return { activeChatId, messages, isStreaming, error };
}
```

- [ ] **Step 4: Rewrite use-send-message.ts**

Replace the full file `apps/backoffice/src/features/chat/logic/use-send-message.ts`:

```ts
import { uuid } from '@/lib/uuid';
import { useChatStore } from '@/features/chat/logic/chat-store';
import { useChatStream, streamAssistantReply } from '@/features/chat/logic/use-chat-stream';
import { generateChatTitle } from '@/features/chat/logic/generate-chat-title';
import { useChatRepository } from '@/features/chat/logic/chat-repository-context';
import type { ChatRepository } from '@/services/chat-repository';
import type { ChatMessage, NewChatSession } from '@/types/chat';

let lastAttempt: { chatId: string; content: string } | null = null;
let abortController: AbortController | null = null;

async function persistTurn(
  repo: ChatRepository,
  chatId: string,
  userMessage: ChatMessage,
  now: string,
  newSession?: NewChatSession,
) {
  if (newSession) {
    await repo.createSession(newSession);
  } else {
    await repo.updateSession(chatId, { updatedAt: now });
  }
  await repo.addMessage(userMessage);
}

async function requestAssistantReply(chatId: string, content: string) {
  abortController?.abort();
  abortController = new AbortController();
  lastAttempt = { chatId, content };
  await streamAssistantReply(chatId, content, abortController.signal);
}

export function useSendMessage() {
  const repo = useChatRepository();
  const { activeChatId, messages, isStreaming, error } = useChatStream();
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const addSession = useChatStore((state) => state.addSession);
  const addMessage = useChatStore((state) => state.addMessage);

  // The server persists the assistant's reply itself (send-message.ts) once
  // the stream completes — the client only renders it, never re-posts it.

  async function sendMessage(content: string) {
    const isNewChat = activeChatId === null;
    const chatId = activeChatId ?? uuid();
    const now = new Date().toISOString();

    if (isNewChat) setActiveChat(chatId);

    const userMessage = { id: uuid(), sessionId: chatId, role: 'user' as const, content, createdAt: now };
    addMessage(chatId, userMessage);

    let newSession: NewChatSession | undefined;
    if (isNewChat) {
      newSession = { id: chatId, title: generateChatTitle(content), pinned: false, createdAt: now, updatedAt: now };
      addSession({ ...newSession, userId: '' });
    }
    await persistTurn(repo, chatId, userMessage, now, newSession);
    await requestAssistantReply(chatId, content);
  }

  function retry() {
    if (!lastAttempt) return;
    void requestAssistantReply(lastAttempt.chatId, lastAttempt.content);
  }

  return { activeChatId, messages, isStreaming, error, sendMessage, retry };
}
```

- [ ] **Step 5: Build both apps**

```bash
cd apps/api && pnpm build
cd ../backoffice && pnpm build
```

Expected: both exit 0, no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/presentation/http/validate.ts
git add apps/backoffice/src/features/chat/logic/chat-api-client.ts
git add apps/backoffice/src/features/chat/logic/use-chat-stream.ts
git add apps/backoffice/src/features/chat/logic/use-send-message.ts
git commit -m "refactor: slim chat payload to {chatId,content} + AbortController (A3, A6)"
```

---

## Task 7: A7 — Optimistic rollback for togglePin and renameChat

**Problem:** `togglePin` updates the store then fires the API call with no error handling — if the call fails, the UI is stuck in the wrong state. `renameChat` has a catch block but doesn't restore the previous title.

**Files:**
- Modify: `apps/backoffice/src/features/chat/logic/use-chat-sessions.ts`

- [ ] **Step 1: Add snapshot + rollback to togglePin**

Replace the `togglePin` function inside `useChatSessions()`:

```ts
async function togglePin(chatId: string) {
  const session = sessions.find((s) => s.id === chatId);
  if (!session) return;
  const prevPinned = session.pinned;
  togglePinSession(chatId); // optimistic
  try {
    await chatRepository.updateSession(chatId, { pinned: !prevPinned });
  } catch {
    togglePinSession(chatId); // rollback
    toast.error('Failed to toggle pin');
  }
}
```

- [ ] **Step 2: Add snapshot + rollback to renameChat**

Replace the `renameChat` function inside `useChatSessions()`:

```ts
async function renameChat(chatId: string, title: string) {
  const session = sessions.find((s) => s.id === chatId);
  if (!session) return;
  const prevTitle = session.title;
  renameSession(chatId, title); // optimistic
  try {
    await chatRepository.updateSession(chatId, { title });
    toast.success('Chat renamed');
  } catch {
    renameSession(chatId, prevTitle); // rollback
    toast.error('Failed to rename chat');
  }
}
```

- [ ] **Step 3: Build**

```bash
cd apps/backoffice && pnpm build
```

Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add apps/backoffice/src/features/chat/logic/use-chat-sessions.ts
git commit -m "fix(backoffice): add optimistic rollback for togglePin and renameChat (A7)"
```

---

## Task 8: A8 — Memoize expensive list derivations

**Problem:** `filterChats`, `deriveTopics`, and `ChatTopicNav`'s `messages.filter` run on every render. At small scale this is invisible; at hundreds of sessions or long conversations the filter + sort cascades become noticeable.

**Files:**
- Modify: `apps/backoffice/src/features/chat/components/chat-list.tsx`
- Modify: `apps/backoffice/src/features/chat/components/chat-thread.tsx`
- Modify: `apps/backoffice/src/features/chat/components/chat-topic-nav.tsx`

- [ ] **Step 1: Memoize filterChats in chat-list.tsx**

Add `useMemo` to the React import and wrap the `filterChats` call:

```tsx
// Add useMemo to imports
import { useMemo } from 'react';

// Change line 31:
// FROM: const { pinned, history } = filterChats(sessions, query);
// TO:
const { pinned, history } = useMemo(() => filterChats(sessions, query), [sessions, query]);
```

- [ ] **Step 2: Memoize deriveTopics in chat-thread.tsx**

Add `useMemo` to the React imports (alongside `useEffect`, `useRef` added in Task 2) and wrap the `deriveTopics` call:

```tsx
// Change the deriveTopics line:
// FROM: const topics = deriveTopics(messages, sessions);
// TO:
const topics = useMemo(() => deriveTopics(messages, sessions), [messages, sessions]);
```

- [ ] **Step 3: Memoize and memo-wrap ChatTopicNav**

Replace the full file `apps/backoffice/src/features/chat/components/chat-topic-nav.tsx`:

```tsx
import { memo, useMemo } from 'react';
import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';

function truncateLabel(text: string, maxChars = 40): string {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  return trimmed.length <= maxChars ? trimmed : `${trimmed.slice(0, maxChars)}…`;
}

const hoveredIdStore = new Store<string | null>(null);

export const ChatTopicNav = memo(function ChatTopicNav({ messages }: { messages: ChatMessage[] }) {
  const hoveredId = useStore(hoveredIdStore, (s) => s);
  const userMessages = useMemo(() => messages.filter((m) => m.role === 'user'), [messages]);

  if (userMessages.length < 2) return null;

  function handleSelect(id: string) {
    document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-end gap-2 mr-3 md:flex">
      {userMessages.map((message) => (
        <div key={message.id} className="relative flex items-center">
          {hoveredId === message.id && (
            <div className="absolute right-5 max-w-56 rounded-lg bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10 whitespace-nowrap overflow-hidden text-ellipsis">
              {truncateLabel(message.content)}
            </div>
          )}
          <button
            type="button"
            aria-label={truncateLabel(message.content)}
            onMouseEnter={() => hoveredIdStore.setState(() => message.id)}
            onMouseLeave={() => hoveredIdStore.setState((id) => (id === message.id ? null : id))}
            onClick={() => handleSelect(message.id)}
            className={cn(
              'size-2 rounded-full transition-all duration-200',
              hoveredId === message.id ? 'scale-125 bg-primary' : 'bg-muted-foreground/40 hover:bg-primary/70',
            )}
          />
        </div>
      ))}
    </div>
  );
});
```

- [ ] **Step 4: Build**

```bash
cd apps/backoffice && pnpm build
```

Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add apps/backoffice/src/features/chat/components/chat-list.tsx
git add apps/backoffice/src/features/chat/components/chat-thread.tsx
git add apps/backoffice/src/features/chat/components/chat-topic-nav.tsx
git commit -m "perf(backoffice): memoize filterChats, deriveTopics, ChatTopicNav (A8)"
```

---

## Architectural Summary

### What changed and why

| Issue | Root cause | Fix |
|---|---|---|
| A1a | Render-body side effect via module flag | `useEffect([], [])` |
| A1b | Module-level DOM refs + rAF in render | `useRef` + two `useEffect`s |
| A2 | Mutable global masquerading as React context | `createContext`/`useContext` |
| A3 | O(n) history payload server already discards | Send `{chatId, content}` only |
| A4 | Three independent SSE parsers/serializers | Shared `sse-codec.ts` per app |
| A5 | Client interface has server-only contract | Drop two methods from client interface |
| A6 | Uncancel-able streaming fetch | `AbortController` in `useSendMessage` |
| A7 | Optimistic store updates with no rollback | Snapshot before + restore on catch |
| A8 | filter/sort/map on every render | `useMemo` + `React.memo` |

### Not addressed
- **A9** (copy-pasted route boilerplate exports) — minor drift risk, no logic defect, skipped per YAGNI.
- C1, C2, C3 — already fixed in commit `9bf1987`.
