import { Input } from '@/components/ui/input';

export function SearchBar({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (query: string) => void;
}) {
  return (
    <Input
      type="search"
      placeholder="Search chats"
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      className="mb-2"
    />
  );
}
