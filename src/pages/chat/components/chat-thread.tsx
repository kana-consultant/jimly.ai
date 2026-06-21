import { useChatStore } from '@/pages/chat/logic/chat-store';
import { ChatBubble } from '@/pages/chat/components/chat-bubble';
import { StreamingIndicator } from '@/pages/chat/components/streaming-indicator';

export function ChatThread({ chatId }: { chatId: string }) {
  const messages = useChatStore((state) => state.messagesByChatId[chatId] ?? []);
  const isStreaming = useChatStore((state) => state.isStreaming);

  const lastMessage = messages[messages.length - 1];
  const showIndicator = isStreaming && lastMessage?.role === 'assistant' && lastMessage.content === '';

  return (
    <div className="flex flex-col gap-3 p-4">
      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} />
      ))}
      {showIndicator && <StreamingIndicator />}
    </div>
  );
}
