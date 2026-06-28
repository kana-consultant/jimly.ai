import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';

function truncateLabel(text: string, maxChars = 40): string {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  return trimmed.length <= maxChars ? trimmed : `${trimmed.slice(0, maxChars)}…`;
}

const hoveredIdStore = new Store<string | null>(null);

export function ChatTopicNav({ messages }: { messages: ChatMessage[] }) {
  const hoveredId = useStore(hoveredIdStore, (s) => s);
  const userMessages = messages.filter((m) => m.role === 'user');

  if (userMessages.length < 2) return null;

  function handleSelect(id: string) {
    document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-end gap-2 mr-3 md:flex">
      {userMessages.map((message) => (
        <div key={message.id} className="relative flex items-center">
          {hoveredId === message.id && (
            <div className="absolute right-5 max-w-56 rounded-lg bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10 whitespace-nowrap overflow-hidden text-ellipsis">
              {truncateLabel(message.content)}
            </div>
          )}
          <button
            type="button"
            aria-label={truncateLabel(message.content)}
            onMouseEnter={() => hoveredIdStore.setState(() => message.id)}
            onMouseLeave={() => hoveredIdStore.setState((id) => (id === message.id ? null : id))}
            onClick={() => handleSelect(message.id)}
            className={cn(
              'size-2 rounded-full transition-all duration-200',
              hoveredId === message.id ? 'scale-125 bg-primary' : 'bg-muted-foreground/40 hover:bg-primary/70',
            )}
          />
        </div>
      ))}
    </div>
  );
}
