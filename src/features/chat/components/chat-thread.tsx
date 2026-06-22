import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/features/chat/logic/chat-store';
import { useSendMessage } from '@/features/chat/logic/use-send-message';
import { ChatBubble } from '@/features/chat/components/chat-bubble';
import { StreamingIndicator } from '@/features/chat/components/streaming-indicator';
import { SuggestedTopics } from '@/features/chat/components/suggested-topics';
import type { ChatMessage } from '@/types/chat';

const EMPTY_MESSAGES: ChatMessage[] = [];

export function ChatThread() {
  const activeChatId = useChatStore((state) => state.activeChatId);
  const messages = useChatStore((state) => state.messagesByChatId[activeChatId ?? ''] ?? EMPTY_MESSAGES);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const { sendMessage } = useSendMessage();

  const bottomRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const lastMessage = messages[messages.length - 1];
  const showIndicator = isStreaming && lastMessage?.role === 'assistant' && lastMessage.content === '';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isStreaming]);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-linear-to-b from-background to-transparent transition-opacity duration-200',
          scrolled ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        className="flex-1 overflow-y-auto"
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
      >
        <div className="mx-auto w-full max-w-2xl">
          {!activeChatId || messages.length === 0 ? (
            <div className="flex flex-1 min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-8 text-center text-sm text-muted-foreground">
              {!activeChatId ? (
                <>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">Ada yang bisa saya bantu?</h2>
                    <p className="text-muted-foreground">Mulai obrolan baru dengan jimly.ai</p>
                  </div>
                  <div className="w-full max-w-md mt-2">
                    <SuggestedTopics onSelect={sendMessage} />
                  </div>
                </>
              ) : (
                showIndicator && <StreamingIndicator />
              )}
            </div>
          ) : (
            <div className="flex flex-col justify-start gap-4 px-4 py-6 md:px-6 w-full max-w-3xl mx-auto min-h-full">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}

              {showIndicator && <StreamingIndicator />}

              <div ref={bottomRef} className="h-2" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
