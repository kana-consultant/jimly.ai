import { useMemo, useState } from 'react';
import { useChatSessions } from '@/features/chat/logic/use-chat-sessions';
import { filterChats } from '@/features/chat/logic/use-filtered-chats';
import { SearchBar } from '@/features/chat/components/search-bar';
import { PinnedSection } from '@/features/chat/components/pinned-section';
import { HistorySection } from '@/features/chat/components/history-section';
import { DeleteChatDialog } from '@/features/chat/components/delete-chat-dialog';
import { Button } from '@/components/ui/button';

export function ChatList() {
  const { sessions, activeChatId, selectChat, newChat, deleteChat, togglePin } = useChatSessions();
  const [query, setQuery] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { pinned, history } = useMemo(() => filterChats(sessions, query), [sessions, query]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Button variant="outline" className="mb-2" onClick={newChat}>
        New Chat
      </Button>
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
