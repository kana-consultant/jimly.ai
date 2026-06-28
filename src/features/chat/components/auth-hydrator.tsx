import { useAuthStore } from '@/stores/auth-store';

let hydrated = false;

export function AuthHydrator({ id, email, name }: { id: string; email: string; name?: string }) {
  if (!hydrated) {
    hydrated = true;
    useAuthStore.getState().setUser({ id, email, name, createdAt: '' });
  }

  return null;
}
