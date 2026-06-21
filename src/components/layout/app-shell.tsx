import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChatSidebar } from '@/features/chat/components/sidebar';
import { ChatHeader } from '@/features/chat/components/chat-header';
import { ChatThread } from '@/features/chat/components/chat-thread';
import { ChatInput } from '@/features/chat/components/chat-input';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex">
          <ChatSidebar />
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="relative z-50 flex bg-background">
              <ChatSidebar />
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

          <div className="relative flex flex-1 flex-col overflow-hidden">
            <ChatHeader />

            <div
              className={cn(
                'pointer-events-none absolute inset-x-0 top-12 z-10 h-6 bg-gradient-to-b from-background to-transparent transition-opacity duration-200',
                scrolled ? 'opacity-100' : 'opacity-0',
              )}
            />

            <div
              className="flex-1 overflow-y-auto"
              onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
            >
              <div className="mx-auto w-full max-w-2xl">
                <ChatThread />
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-2xl">
            <ChatInput />
          </div>
        </div>
      </div>

      <footer className="border-t p-2 text-center text-xs text-muted-foreground">
        jimly.ai can make mistakes. Please verify important information.
      </footer>
    </div>
  );
}
