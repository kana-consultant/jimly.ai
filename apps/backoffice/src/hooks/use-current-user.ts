import { useSession } from '@/libs/auth/client';

export function useCurrentUser() {
  const { data } = useSession();
  return data?.user ?? null;
}
