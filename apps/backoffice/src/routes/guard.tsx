import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useSession } from '@/libs/auth/client';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { data, isPending } = useSession();
  if (isPending) return null;
  if (!data) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RedirectIfAuth({ children }: { children: ReactNode }) {
  const { data, isPending } = useSession();
  if (isPending) return null;
  if (data) return <Navigate to="/chat" replace />;
  return <>{children}</>;
}
