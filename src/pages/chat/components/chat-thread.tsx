import { useChatStore } from '@/pages/chat/logic/chat-store';
import { useChatStream } from '@/pages/chat/logic/use-chat-stream';
import { ChatBubble } from '@/pages/chat/components/chat-bubble';
import { StreamingIndicator } from '@/pages/chat/components/streaming-indicator';
import { SuggestedTopics } from '@/pages/chat/components/suggested-topics';
import type { ChatMessage } from '@/types/chat';

const EMPTY_MESSAGES: ChatMessage[] = [];

export function ChatThread() {
  const activeChatId = useChatStore((state) => state.activeChatId);
  const messages = useChatStore((state) => state.messagesByChatId[activeChatId ?? ''] ?? EMPTY_MESSAGES);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const { sendMessage } = useChatStream();

  const lastMessage = messages[messages.length - 1];
  const showIndicator = isStreaming && lastMessage?.role === 'assistant' && lastMessage.content === '';

  if (!activeChatId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-sm text-muted-foreground">
        <p>Start a new chat</p>
        <div className="w-full max-w-sm">
          <SuggestedTopics onSelect={sendMessage} />
        </div>
      </div>
    );
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
