import { useRef, type ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useSession } from '@/libs/auth/client';
import { Skeleton } from '@/components/ui/skeleton';

function ChatPageSkeleton() {
  return (
    <div className="flex h-dvh w-full flex-col md:flex-row bg-background">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 md:hidden">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-5 w-28 rounded" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex w-64 shrink-0 border-r border-border p-4 flex-col gap-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <div className="flex flex-col gap-2 mt-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-8 w-72 max-w-full rounded" />
          <Skeleton className="h-12 w-full max-w-xl rounded-xl mt-4" />
        </div>
      </div>
    </div>
  );
}

function AuthPageSkeleton() {
  return (
    <div className="flex h-dvh w-full flex-col md:flex-row bg-background overflow-y-auto md:overflow-hidden">
      <div className="w-full shrink-0 md:h-full md:w-1/2 bg-[#102A43] px-8 py-10 sm:px-12 sm:py-14 flex flex-col justify-between min-h-[260px] md:min-h-0">
        <div className="flex items-center justify-between">
          <div className="h-4 w-14 rounded bg-white/25" />
          <div className="h-4 w-20 rounded bg-white/15" />
        </div>
        <div className="flex flex-col gap-3 my-6 md:my-0 md:mt-20">
          <div className="h-10 w-4/5 rounded bg-white/20" />
          <div className="h-10 w-3/5 rounded bg-white/20" />
          <div className="h-4 w-full rounded bg-white/10 mt-3" />
          <div className="h-4 w-5/6 rounded bg-white/10" />
          <div className="h-10 w-44 rounded-full bg-white/10 mt-5" />
        </div>
        <div className="hidden sm:block h-12 w-full rounded bg-white/10" />
      </div>

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
  const initializedRef = useRef(false);
  const lastDataRef = useRef(data);

  if (!isPending) {
    initializedRef.current = true;
    lastDataRef.current = data;
  }

  if (!initializedRef.current) return <ChatPageSkeleton />;

  // During background refetch, trust last known session to avoid flash
  const effectiveData = isPending ? lastDataRef.current : data;

  if (!effectiveData) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RedirectIfAuth({ children }: { children: ReactNode }) {
  const { data, isPending } = useSession();
  const initializedRef = useRef(false);
  const lastDataRef = useRef(data);

  if (!isPending) {
    initializedRef.current = true;
    lastDataRef.current = data;
  }

  if (!initializedRef.current) return <AuthPageSkeleton />;

  const effectiveData = isPending ? lastDataRef.current : data;

  if (effectiveData) return <Navigate to="/chat" replace />;
  return <>{children}</>;
}
