import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function SearchBar({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (query: string) => void;
}) {
  return (
    <div className="relative mb-2">
      <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search chats"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="pl-8"
      />
    </div>
  );
}
