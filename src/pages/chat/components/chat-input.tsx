import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useChatStream } from '@/pages/chat/logic/use-chat-stream';

export function ChatInput() {
  const [value, setValue] = useState('');
  const { isStreaming, error, sendMessage, retry } = useChatStream();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = value.trim();
    if (!content || isStreaming) return;
    setValue('');
    await sendMessage(content);
  }

  return (
    <div className="border-t p-4">
      {error && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <span>{error}</span>
          <Button type="button" variant="outline" size="sm" onClick={retry}>
            Retry
          </Button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Message jimly.ai..."
          disabled={isStreaming}
        />
        <Button type="submit" disabled={isStreaming || !value.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
