import { useCurrentUser } from '@/hooks/use-current-user';
import { getDisplayName } from '@/lib/display-name';
import { Sidebar } from '@/components/ui/sidebar';
import { ChatList } from '@/features/chat/components/chat-list';
import { LogoutButton } from '@/components/layout/logout-button';

function initial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export function ChatSidebar() {
  const user = useCurrentUser();
  const displayName = getDisplayName(user, 'User');
  const avatarChar = initial(displayName);

  return (
    <Sidebar
      header={(collapsed) =>
        collapsed ? (
          <img src="/logo.png" alt="jimly.ai" className="size-7 rounded-lg shrink-0" />
        ) : (
          <div className="flex w-full items-center gap-2.5">
            <img src="/logo.png" alt="jimly.ai" className="size-7 rounded-lg shrink-0" />
            <span className="truncate text-sm font-bold">jimly.ai</span>
          </div>
        )
      }
      footer={(collapsed) => (
        <div className="flex flex-col gap-3">
          <LogoutButton iconOnly={collapsed} />
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {avatarChar}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate">{displayName}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.email ?? ''}</span>
              </div>
            )}
          </div>
        </div>
      )}
    >
      {(collapsed, expand) => <ChatList collapsed={collapsed} onExpand={expand} />}
    </Sidebar>
  );
}
