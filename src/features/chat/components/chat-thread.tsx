import { useChatStore } from '@/features/chat/logic/chat-store';
import { useChatStream } from '@/features/chat/logic/use-chat-stream';
import { ChatBubble } from '@/features/chat/components/chat-bubble';
import { StreamingIndicator } from '@/features/chat/components/streaming-indicator';
import { SuggestedTopics } from '@/features/chat/components/suggested-topics';
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-3 py-4 text-center text-sm text-muted-foreground sm:px-4">
        <p>Start a new chat</p>
        <div className="w-full max-w-sm">
          <SuggestedTopics onSelect={sendMessage} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-3 py-4 sm:px-4">
      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} />
      ))}
      {showIndicator && <StreamingIndicator />}
    </div>
  );
}
