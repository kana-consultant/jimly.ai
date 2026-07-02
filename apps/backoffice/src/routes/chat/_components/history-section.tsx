import { History } from 'lucide-react';
import { ChatListItem } from '@/routes/chat/_components/chat-list-item';
import type { ChatSession } from '@/routes/chat/types';

export function HistorySection({
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
        <History className="size-3.5" />
        History
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
