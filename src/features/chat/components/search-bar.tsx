import { Search } from 'lucide-react';

export function SearchBar({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (query: string) => void;
}) {
  return (
    <div className="relative mb-3">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        placeholder="Search chats..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
      />
    </div>
  );
}
