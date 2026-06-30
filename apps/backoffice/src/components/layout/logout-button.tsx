import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logoutUser } from '@/lib/auth-api-client';
import { LogoutConfirmDialog } from '@/components/layout/logout-confirm-dialog';

export function LogoutButton({ iconOnly = false }: { iconOnly?: boolean }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = '/login';
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        aria-label="Log out"
        className="flex w-full items-center rounded-xl bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 active:scale-[0.98]"
      >
        <span className="flex size-10 shrink-0 items-center justify-center">
          <LogOut className="size-4" />
        </span>
        <span
          className={cn(
            'overflow-hidden whitespace-nowrap text-left text-sm font-medium transition-all duration-300 ease-in-out',
            iconOnly ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100 pr-2',
          )}
        >
          Log out
        </span>
      </button>
      <LogoutConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleLogout}
      />
    </>
  );
}
