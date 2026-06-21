import { ChatListItem } from '@/features/chat/components/chat-list-item';
import type { ChatSession } from '@/types/chat';

export function HistorySection({
  sessions,
  activeChatId,
  onSelect,
  onTogglePin,
  onDelete,
}: {
  sessions: ChatSession[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onTogglePin: (chatId: string) => void;
  onDelete: (chatId: string) => void;
}) {
  if (sessions.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <p className="px-2 text-xs font-medium text-muted-foreground">History</p>
      {sessions.map((session) => (
        <ChatListItem
          key={session.id}
          session={session}
          isActive={session.id === activeChatId}
          onSelect={() => onSelect(session.id)}
          onTogglePin={() => onTogglePin(session.id)}
          onDelete={() => onDelete(session.id)}
        />
      ))}
    </div>
  );
}
