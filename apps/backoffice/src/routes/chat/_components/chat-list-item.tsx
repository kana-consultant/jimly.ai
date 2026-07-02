import { MoreVertical, Pencil, Pin, PinOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/libs/utils';
import type { ChatSession } from '@/routes/chat/types';

export function ChatListItem({
  session,
  isActive,
  onSelect,
  onTogglePin,
  onDelete,
  onRename,
}: {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
  onRename: () => void;
}) {
  return (
    <div
      className={cn(
        'group flex items-center gap-1 rounded-xl px-2.5 py-2 text-sm transition-colors cursor-pointer',
        isActive ? 'bg-hover text-foreground' : 'hover:bg-hover text-muted-foreground hover:text-foreground',
      )}
    >
      <button className="flex flex-1 items-center gap-2 truncate text-left" onClick={onSelect}>
        <span className="truncate">{session.title}</span>
      </button>

      {session.pinned && (
        <Pin className="size-3.5 text-primary fill-primary/20 shrink-0" />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Chat options"
            >
              <MoreVertical className="size-3.5" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onRename}>
            <Pencil className="size-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onTogglePin}>
            {session.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
            {session.pinned ? 'Unpin' : 'Pin'}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}