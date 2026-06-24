import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export function AuthHydrator({ id, email, name }: { id: string; email: string; name?: string }) {
  useEffect(() => {
    useAuthStore.getState().setUser({ id, email, name, createdAt: '' });
  }, [id, email, name]);

  return null;
}
