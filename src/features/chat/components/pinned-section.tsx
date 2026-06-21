import { Pin } from 'lucide-react';
import { ChatListItem } from '@/features/chat/components/chat-list-item';
import type { ChatSession } from '@/types/chat';

export function PinnedSection({
  sessions,
  activeChatId,
  onSelect,
  onTogglePin,
  onDelete,
  onRename,
}: {
  sessions: ChatSession[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onTogglePin: (chatId: string) => void;
  onDelete: (chatId: string) => void;
  onRename: (chatId: string) => void;
}) {
  if (sessions.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <p className="flex items-center gap-1.5 px-2 text-xs font-medium text-sidebar-foreground/60">
        <Pin className="size-3.5" />
        Pinned
      </p>
      {sessions.map((session) => (
        <ChatListItem
          key={session.id}
          session={session}
          isActive={session.id === activeChatId}
          onSelect={() => onSelect(session.id)}
          onTogglePin={() => onTogglePin(session.id)}
          onDelete={() => onDelete(session.id)}
          onRename={() => onRename(session.id)}
        />
      ))}
    </div>
  );
}
