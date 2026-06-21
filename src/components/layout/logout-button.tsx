import { Button } from '@/components/ui/button';
import { logoutUser } from '@/lib/auth-api-client';

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      className="mt-2"
      onClick={async () => {
        await logoutUser();
        window.location.href = '/login';
      }}
    >
      Log out
    </Button>
  );
}
