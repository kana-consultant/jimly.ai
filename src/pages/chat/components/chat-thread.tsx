import { useChatStore } from '@/pages/chat/logic/chat-store';
import { ChatBubble } from '@/pages/chat/components/chat-bubble';
import { StreamingIndicator } from '@/pages/chat/components/streaming-indicator';

export function ChatThread() {
  const activeChatId = useChatStore((state) => state.activeChatId);
  const messages = useChatStore((state) => state.messagesByChatId[activeChatId ?? ''] ?? []);
  const isStreaming = useChatStore((state) => state.isStreaming);

  const lastMessage = messages[messages.length - 1];
  const showIndicator = isStreaming && lastMessage?.role === 'assistant' && lastMessage.content === '';

  if (!activeChatId) {
    return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Start a new chat</div>;
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} />
      ))}
      {showIndicator && <StreamingIndicator />}
    </div>
  );
}
