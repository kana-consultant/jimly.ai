import type { ChatSession } from '@/routes/chat/types';

export interface FilteredChats {
  pinned: ChatSession[];
  history: ChatSession[];
}

function byUpdatedAtDesc(a: ChatSession, b: ChatSession) {
  return b.updatedAt.localeCompare(a.updatedAt);
}

export function filterChats(sessions: ChatSession[], query: string): FilteredChats {
  const normalized = query.trim().toLowerCase();
  const matches = normalized
    ? sessions.filter((s) => s.title.toLowerCase().includes(normalized))
    : sessions;

  return {
    pinned: matches.filter((s) => s.pinned).sort(byUpdatedAtDesc),
    history: matches.filter((s) => !s.pinned).sort(byUpdatedAtDesc),
  };
}
