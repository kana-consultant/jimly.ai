import { MoreVertical, Pencil, Pin, PinOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { DeleteChatDialog } from '@/features/chat/components/delete-chat-dialog';
import { RenameChatDialog } from '@/features/chat/components/rename-chat-dialog';
import { useChatSessions } from '@/features/chat/logic/use-chat-sessions';

export function ChatHeader() {
  const { sessions, activeChatId, deleteChat, togglePin, renameChat } = useChatSessions();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [renaming, setRenaming] = useState(false);

  const activeSession = sessions.find((s) => s.id === activeChatId) ?? null;

  return (
    <>
      <div className="flex h-12 shrink-0 items-center justify-end border-b px-3 sm:px-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Chat options" disabled={!activeSession}>
                <MoreVertical className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setRenaming(true)}>
              <Pencil className="size-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => activeSession && togglePin(activeSession.id)}>
              {activeSession?.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
              {activeSession?.pinned ? 'Unpin' : 'Pin'}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" />
              Delete chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {activeSession && (
        <RenameChatDialog
          open={renaming}
          initialTitle={activeSession.title}
          onOpenChange={setRenaming}
          onConfirm={(title) => {
            renameChat(activeSession.id, title);
            setRenaming(false);
          }}
        />
      )}

      <DeleteChatDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={() => {
          if (activeChatId) deleteChat(activeChatId);
          setConfirmDelete(false);
        }}
      />
    </>
  );
}
