export function StreamingIndicator() {
  return (
    <div className="flex w-full justify-start gap-3 items-start">
      <img src="/logo.png" alt="AI" className="w-7 h-7 rounded-full mt-0.5 shrink-0" />
      <div className="flex flex-col gap-2 max-w-sm w-full">
        <div className="h-3 rounded-full bg-muted-foreground/15 animate-pulse w-3/4" />
        <div className="h-3 rounded-full bg-muted-foreground/15 animate-pulse w-full" />
        <div className="h-3 rounded-full bg-muted-foreground/15 animate-pulse w-2/4" />
      </div>
    </div>
  );
}

export function MiniSkeleton() {
  return (
    <div className="flex w-full justify-start gap-3 items-center">
      <img src="/logo.png" alt="AI" className="w-7 h-7 rounded-full shrink-0" />
      <div className="flex gap-1.5 items-center py-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
          />
        ))}
      </div>
    </div>
  );
}
