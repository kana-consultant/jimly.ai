import type { LucideIcon } from 'lucide-react';
import { ChatListItem } from '@/routes/chat/_components/chat-list-item';
import type { ChatSession } from '@/routes/chat/types';

interface SessionSectionProps {
  icon: LucideIcon;
  label: string;
  sessions: ChatSession[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onTogglePin: (chatId: string) => void;
  onDelete: (chatId: string) => void;
  onRename: (chatId: string) => void;
}

export function SessionSection({ icon: Icon, label, sessions, activeChatId, onSelect, onTogglePin, onDelete, onRename }: SessionSectionProps) {
  if (sessions.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <p className="flex items-center gap-1.5 px-2 text-xs font-medium text-sidebar-foreground/60">
        <Icon className="size-3.5" />
        {label}
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
