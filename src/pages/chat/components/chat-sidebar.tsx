import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChatSessions } from '@/pages/chat/logic/use-chat-sessions';
import { DeleteChatDialog } from '@/pages/chat/components/delete-chat-dialog';

export function ChatSidebar() {
  const { sessions, activeChatId, selectChat, newChat, deleteChat } = useChatSessions();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  return (
    <aside className="flex w-64 flex-col border-r p-2">
      <Button variant="outline" className="mb-2" onClick={newChat}>
        New Chat
      </Button>
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              'group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm',
              session.id === activeChatId ? 'bg-muted' : 'hover:bg-muted/50',
            )}
          >
            <button className="flex-1 truncate text-left" onClick={() => selectChat(session.id)}>
              {session.title}
            </button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="opacity-0 group-hover:opacity-100"
              onClick={() => setPendingDeleteId(session.id)}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
      <DeleteChatDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) deleteChat(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />
    </aside>
  );
}
