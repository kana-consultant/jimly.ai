import { ChatList } from '@/features/chat/components/chat-list';
import { LogoutButton } from '@/components/layout/logout-button';

export function Sidebar() {
  return (
    <aside className="flex w-64 flex-col border-r p-2">
      <ChatList />
      <LogoutButton />
    </aside>
  );
}
