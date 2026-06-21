import { MessageSquare, Pin, PinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChatSession } from '@/types/chat';

export function ChatListItem({
  session,
  isActive,
  onSelect,
  onTogglePin,
  onDelete,
}: {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        'group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm',
        isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/60',
      )}
    >
      <button className="flex flex-1 items-center gap-2 truncate text-left" onClick={onSelect}>
        <MessageSquare className="size-3.5 shrink-0" />
        <span className="truncate">{session.title}</span>
      </button>
      <Button
        variant="ghost"
        size="icon-xs"
        className={cn('opacity-0 group-hover:opacity-100', session.pinned && 'opacity-100')}
        onClick={onTogglePin}
      >
        {session.pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        className="opacity-0 group-hover:opacity-100"
        onClick={onDelete}
      >
        ×
      </Button>
    </div>
  );
}
