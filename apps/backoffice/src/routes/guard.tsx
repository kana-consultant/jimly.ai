import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useSession } from '@/libs/auth/client';
import { Skeleton } from '@/components/ui/skeleton';

function ChatPageSkeleton() {
  return (
    <div className="flex h-dvh w-full bg-background">
      <div className="w-64 shrink-0 border-r border-border p-4 flex flex-col gap-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-lg" />
        <div className="flex flex-col gap-2 mt-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        <Skeleton className="w-20 h-20 rounded-full" />
        <Skeleton className="h-5 w-40 rounded" />
        <Skeleton className="h-8 w-72 rounded" />
        <Skeleton className="h-12 w-full max-w-xl rounded-xl mt-4" />
      </div>
    </div>
  );
}

function AuthPageSkeleton() {
  return (
    <div className="flex h-dvh w-full flex-col md:flex-row bg-background">
      <div className="h-28 w-full shrink-0 md:h-full md:w-1/2 bg-[#102A43]" />
      <div className="flex flex-1 flex-col justify-center px-8 py-14 sm:px-14">
        <div className="mx-auto w-full max-w-sm flex flex-col gap-4">
          <Skeleton className="h-10 w-full rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-36 rounded" />
            <Skeleton className="h-4 w-52 rounded" />
          </div>
          <div className="flex flex-col gap-3 mt-2">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { data, isPending } = useSession();
  if (isPending) return <ChatPageSkeleton />;
  if (!data) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RedirectIfAuth({ children }: { children: ReactNode }) {
  const { data, isPending } = useSession();
  if (isPending) return <AuthPageSkeleton />;
  if (data) return <Navigate to="/chat" replace />;
  return <>{children}</>;
}
