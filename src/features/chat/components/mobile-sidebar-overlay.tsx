import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatSidebar } from '@/features/chat/components/sidebar';
import { useMobileNavStore } from '@/features/chat/logic/mobile-nav-store';

export function MobileSidebarOverlay() {
  const open = useMobileNavStore((state) => state.open);
  const close = useMobileNavStore((state) => state.close);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div className="relative z-50 flex bg-background">
        <ChatSidebar />
        <Button variant="ghost" size="icon" className="absolute top-2 right-[-2.5rem]" onClick={close}>
          <X />
        </Button>
      </div>
    </div>
  );
}
