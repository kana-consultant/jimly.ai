import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/pages/chat/components/sidebar';
import { ChatThread } from '@/pages/chat/components/chat-thread';
import { ChatInput } from '@/pages/chat/components/chat-input';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="relative z-50 flex bg-background">
              <Sidebar />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-[-2.5rem]"
                onClick={() => setSidebarOpen(false)}
              >
                <X />
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col">
          <div className="flex items-center border-b p-2 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ChatThread />
          </div>
          <ChatInput />
        </div>
      </div>

      <footer className="border-t p-2 text-center text-xs text-muted-foreground">
        jimly.ai can make mistakes. Please verify important information.
      </footer>
    </div>
  );
}
