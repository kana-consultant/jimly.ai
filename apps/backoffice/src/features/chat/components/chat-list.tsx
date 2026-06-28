import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import { Plus, Search, History } from 'lucide-react';
import { useChatSessions } from '@/features/chat/logic/use-chat-sessions';
import { filterChats } from '@/features/chat/logic/use-filtered-chats';
import { SearchBar } from '@/features/chat/components/search-bar';
import { PinnedSection } from '@/features/chat/components/pinned-section';
import { HistorySection } from '@/features/chat/components/history-section';
import { DeleteChatDialog } from '@/features/chat/components/delete-chat-dialog';
import { RenameChatDialog } from '@/features/chat/components/rename-chat-dialog';
import { cn } from '@/lib/utils';

const queryStore = new Store('');
const pendingDeleteIdStore = new Store<string | null>(null);
const renamingIdStore = new Store<string | null>(null);

export function ChatList({
  collapsed = false,
  onExpand,
}: {
  collapsed?: boolean;
  onExpand?: () => void;
}) {
  const { sessions, activeChatId, selectChat, newChat, deleteChat, togglePin, renameChat } = useChatSessions();
  const query = useStore(queryStore, (s) => s);
  const pendingDeleteId = useStore(pendingDeleteIdStore, (s) => s);
  const renamingId = useStore(renamingIdStore, (s) => s);

  const renamingSession = sessions.find((s) => s.id === renamingId) ?? null;

  const { pinned, history } = filterChats(sessions, query);

  const newChatButton = (
    <button
      type="button"
      onClick={newChat}
      aria-label="New chat"
      className="mb-3 flex w-full items-center rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary-hover active:scale-[0.98] shadow-sm"
    >
      <span className="flex size-10 shrink-0 items-center justify-center">
        <Plus className="size-4" />
      </span>
      <span
        className={cn(
          'overflow-hidden whitespace-nowrap text-left text-sm font-medium transition-all duration-300 ease-in-out',
          collapsed ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100 pr-2',
        )}
      >
        New Chat
      </span>
    </button>
  );

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2">
        {newChatButton}
        <button
          type="button"
          onClick={onExpand}
          aria-label="Search chats"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-hover hover:text-foreground"
        >
          <Search className="size-4" />
        </button>
        <button
          type="button"
          onClick={onExpand}
          aria-label="Chat history"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-hover hover:text-foreground"
        >
          <History className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {newChatButton}
      <SearchBar query={query} onQueryChange={(value) => queryStore.setState(() => value)} />
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        <PinnedSection
          sessions={pinned}
          activeChatId={activeChatId}
          onSelect={selectChat}
          onTogglePin={togglePin}
          onDelete={(id) => pendingDeleteIdStore.setState(() => id)}
          onRename={(id) => renamingIdStore.setState(() => id)}
        />
        <HistorySection
          sessions={history}
          activeChatId={activeChatId}
          onSelect={selectChat}
          onTogglePin={togglePin}
          onDelete={(id) => pendingDeleteIdStore.setState(() => id)}
          onRename={(id) => renamingIdStore.setState(() => id)}
        />
      </div>
      <DeleteChatDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && pendingDeleteIdStore.setState(() => null)}
        onConfirm={() => {
          if (pendingDeleteId) deleteChat(pendingDeleteId);
          pendingDeleteIdStore.setState(() => null);
        }}
      />
      {renamingSession && (
        <RenameChatDialog
          open={renamingId !== null}
          initialTitle={renamingSession.title}
          onOpenChange={(open) => !open && renamingIdStore.setState(() => null)}
          onConfirm={(title) => {
            renameChat(renamingSession.id, title);
            renamingIdStore.setState(() => null);
          }}
        />
      )}
    </div>
  );
}
