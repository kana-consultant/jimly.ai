import { ChatSidebar } from '@/routes/chat/_components/sidebar';
import { MobileSidebarOverlay } from '@/routes/chat/_components/mobile-sidebar-overlay';
import { ChatHeader } from '@/routes/chat/_components/chat-header';
import { ChatThread } from '@/routes/chat/_components/chat-thread';

// Phase 5 wires real session identity into the auth store (replacing the
// server-rendered `Astro.locals` hydration this page used before the SPA move).
export function ChatRoute() {
  return (
    <div className="flex h-dvh flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex">
          <ChatSidebar />
        </div>

        <MobileSidebarOverlay />

        <div className="flex flex-1 flex-col relative">
          <ChatHeader />
          <ChatThread />
        </div>
      </div>
    </div>
  );
}
