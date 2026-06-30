import * as React from "react"

import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

function ChatSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-hidden="true">
      <div className="flex items-start gap-3 flex-row-reverse">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <Skeleton className="h-12 w-2/3 rounded-lg rounded-tr-md" />
      </div>
      <div className="flex items-start gap-3">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <Skeleton className="h-20 w-3/4 rounded-lg rounded-tl-md" />
      </div>
    </div>
  )
}

export { Skeleton, ChatSkeleton }
