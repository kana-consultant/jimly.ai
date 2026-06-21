import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useChatStream } from '@/pages/chat/logic/use-chat-stream';

export function ChatInput({ chatId }: { chatId: string }) {
  const [value, setValue] = useState('');
  const { isStreaming, sendMessage } = useChatStream(chatId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = value.trim();
    if (!content || isStreaming) return;
    setValue('');
    await sendMessage(content);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t p-4">
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
  );
}
