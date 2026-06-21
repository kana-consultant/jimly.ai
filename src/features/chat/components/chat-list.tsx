import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useChatSessions } from '@/features/chat/logic/use-chat-sessions';
import { filterChats } from '@/features/chat/logic/use-filtered-chats';
import { SearchBar } from '@/features/chat/components/search-bar';
import { PinnedSection } from '@/features/chat/components/pinned-section';
import { HistorySection } from '@/features/chat/components/history-section';
import { DeleteChatDialog } from '@/features/chat/components/delete-chat-dialog';
import { cn } from '@/lib/utils';

export function ChatList({ collapsed = false }: { collapsed?: boolean }) {
  const { sessions, activeChatId, selectChat, newChat, deleteChat, togglePin } = useChatSessions();
  const [query, setQuery] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { pinned, history } = useMemo(() => filterChats(sessions, query), [sessions, query]);

  const newChatButton = (
    <button
      type="button"
      onClick={newChat}
      aria-label="New chat"
      className="mb-2 flex w-full items-center rounded-lg border border-sidebar-border text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      <span className="flex size-10 shrink-0 items-center justify-center">
        <Plus className="size-4" />
      </span>
      <span
        className={cn(
          'overflow-hidden whitespace-nowrap text-left text-sm transition-all duration-300 ease-in-out',
          collapsed ? 'max-w-0 opacity-0' : 'max-w-[10rem] opacity-100 pr-2',
        )}
      >
        New Chat
      </span>
    </button>
  );

  if (collapsed) {
    return newChatButton;
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
        />
        <HistorySection
          sessions={history}
          activeChatId={activeChatId}
          onSelect={selectChat}
          onTogglePin={togglePin}
          onDelete={setPendingDeleteId}
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
    </div>
  );
}
