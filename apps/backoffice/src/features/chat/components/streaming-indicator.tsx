export function StreamingIndicator() {
  return (
    <div className="flex w-full justify-start gap-3 items-start">
      <img src="/logo.png" alt="AI" className="w-7 h-7 rounded-full mt-0.5 shrink-0" />
      <div className="flex items-center gap-2 bg-muted/60 px-4 py-3 rounded-2xl rounded-tl-xs">
        <span className="text-sm text-muted-foreground font-medium">Thinking</span>
        <span className="inline-flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" />
        </span>
      </div>
    </div>
  );
}
