import { MessagesSquare } from 'lucide-react';
import { Sidebar } from '@/components/ui/sidebar';
import { ChatList } from '@/features/chat/components/chat-list';
import { LogoutButton } from '@/components/layout/logout-button';

export function ChatSidebar() {
  return (
    <Sidebar
      header={(collapsed) =>
        collapsed ? (
          <MessagesSquare className="size-4 shrink-0" />
        ) : (
          <div className="flex w-full items-center gap-2 px-2">
            <MessagesSquare className="size-4 shrink-0" />
            <span className="truncate text-sm font-medium">jimly.ai</span>
          </div>
        )
      }
      footer={(collapsed) => <LogoutButton iconOnly={collapsed} />}
    >
      {(collapsed) => <ChatList collapsed={collapsed} />}
    </Sidebar>
  );
}
