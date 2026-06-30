import { useSession } from '@/auth/client';

export function useCurrentUser() {
  const { data } = useSession();
  return data?.user ?? null;
}
