import { useMemo, useState } from 'react';
import { Plus, Search, History } from 'lucide-react';
import { useChatSessions } from '@/features/chat/logic/use-chat-sessions';
import { filterChats } from '@/features/chat/logic/use-filtered-chats';
import { SearchBar } from '@/features/chat/components/search-bar';
import { PinnedSection } from '@/features/chat/components/pinned-section';
import { HistorySection } from '@/features/chat/components/history-section';
import { DeleteChatDialog } from '@/features/chat/components/delete-chat-dialog';
import { RenameChatDialog } from '@/features/chat/components/rename-chat-dialog';
import { cn } from '@/lib/utils';

export function ChatList({
  collapsed = false,
  onExpand,
}: {
  collapsed?: boolean;
  onExpand?: () => void;
}) {
  const { sessions, activeChatId, selectChat, newChat, deleteChat, togglePin, renameChat } = useChatSessions();
  const [query, setQuery] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const renamingSession = sessions.find((s) => s.id === renamingId) ?? null;

  const { pinned, history } = useMemo(() => filterChats(sessions, query), [sessions, query]);

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
      <SearchBar query={query} onQueryChange={setQuery} />
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        <PinnedSection
          sessions={pinned}
          activeChatId={activeChatId}
          onSelect={selectChat}
          onTogglePin={togglePin}
          onDelete={setPendingDeleteId}
          onRename={setRenamingId}
        />
        <HistorySection
          sessions={history}
          activeChatId={activeChatId}
          onSelect={selectChat}
          onTogglePin={togglePin}
          onDelete={setPendingDeleteId}
          onRename={setRenamingId}
        />
      </div>
      <DeleteChatDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) deleteChat(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />
      {renamingSession && (
        <RenameChatDialog
          open={renamingId !== null}
          initialTitle={renamingSession.title}
          onOpenChange={(open) => !open && setRenamingId(null)}
          onConfirm={(title) => {
            renameChat(renamingSession.id, title);
            setRenamingId(null);
          }}
        />
      )}
    </div>
  );
}
