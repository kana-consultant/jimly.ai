import type { ChatRepository } from '@/services/chat-repository';
import type { ChatMessage, ChatSession, NewChatSession } from '@/types/chat';

const json = (r: Response) => {
  if (!r.ok) throw new Error(r.statusText);
  return r.json();
};
const send = (url: string, method: string, body?: unknown) =>
  fetch(url, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

export function createHttpChatRepository(): ChatRepository {
  return {
    listSessions: () => send('/api/sessions', 'GET').then(json) as Promise<ChatSession[]>,
    createSession: (s: NewChatSession) => send('/api/sessions', 'POST', s).then(json).then(() => undefined),
    updateSession: (id, patch) => send(`/api/sessions/${id}`, 'PATCH', patch).then(json).then(() => undefined),
    deleteSession: (id) => send(`/api/sessions/${id}`, 'DELETE').then(() => undefined),
    listMessages: (sid) => send(`/api/sessions/${sid}/messages`, 'GET').then(json) as Promise<ChatMessage[]>,
    addMessage: (m: ChatMessage) => send(`/api/sessions/${m.sessionId}/messages`, 'POST', m).then(json).then(() => undefined),
  };
}
