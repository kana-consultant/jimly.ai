import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMobileNavStore } from '@/features/chat/logic/mobile-nav-store';

export function MobileMenuButton() {
  const toggle = useMobileNavStore((state) => state.toggle);

  return (
    <div className="flex items-center border-b p-2 md:hidden">
      <Button variant="ghost" size="icon" onClick={toggle}>
        <Menu />
      </Button>
    </div>
  );
}
