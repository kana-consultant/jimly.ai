import { Menu, MoreVertical, Pencil, Pin, PinOff, Trash2 } from 'lucide-react';
import { Store, useStore } from '@tanstack/react-store';
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
import { useMobileNavStore } from '@/features/chat/logic/mobile-nav-store';

const chatHeaderStore = new Store({ confirmDelete: false, renaming: false });

export function ChatHeader() {
  const { sessions, activeChatId, deleteChat, togglePin, renameChat } = useChatSessions();
  const confirmDelete = useStore(chatHeaderStore, (s) => s.confirmDelete);
  const renaming = useStore(chatHeaderStore, (s) => s.renaming);
  const toggleMobileNav = useMobileNavStore((state) => state.toggle);

  const activeSession = sessions.find((s) => s.id === activeChatId) ?? null;

  return (
    <>
      <div className="flex h-12 shrink-0 items-center justify-between shadow-sm px-3 sm:px-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileNav} aria-label="Open menu">
          <Menu className="size-4" />
        </Button>
        
        <div className="hidden md:block" />

        <div className="ml-auto md:ml-0">
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={!activeSession}
              render={
                <Button variant="ghost" size="icon" aria-label="Chat options">
                  <MoreVertical className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => chatHeaderStore.setState((s) => ({ ...s, renaming: true }))}>
                <Pencil className="size-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => activeSession && togglePin(activeSession.id)}>
                {activeSession?.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                {activeSession?.pinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => chatHeaderStore.setState((s) => ({ ...s, confirmDelete: true }))}>
                <Trash2 className="size-4" />
                Delete chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {activeSession && (
        <RenameChatDialog
          open={renaming}
          initialTitle={activeSession.title}
          onOpenChange={(v) => chatHeaderStore.setState((s) => ({ ...s, renaming: v }))}
          onConfirm={(title) => {
            renameChat(activeSession.id, title);
            chatHeaderStore.setState((s) => ({ ...s, renaming: false }));
          }}
        />
      )}

      <DeleteChatDialog
        open={confirmDelete}
        onOpenChange={(v) => chatHeaderStore.setState((s) => ({ ...s, confirmDelete: v }))}
        onConfirm={() => {
          if (activeChatId) deleteChat(activeChatId);
          chatHeaderStore.setState((s) => ({ ...s, confirmDelete: false }));
        }}
      />
    </>
  );
}
