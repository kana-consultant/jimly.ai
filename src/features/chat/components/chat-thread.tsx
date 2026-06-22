import { useEffect, useRef } from 'react';
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

  const bottomRef = useRef<HTMLDivElement>(null);

  const lastMessage = messages[messages.length - 1];
  const showIndicator = isStreaming && lastMessage?.role === 'assistant' && lastMessage.content === '';

  // Auto-scroll ke bawah tiap kali ada pesan baru atau sedang streaming
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isStreaming]);

  // Tampilan Awal (Kosong / Belum ada chat) - Dibuat Vertikal Tengah
  if (!activeChatId || messages.length === 0) {
    return (
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
    );
  }

  return (
    <div className="flex flex-col justify-start gap-4 px-4 py-6 md:px-6 w-full max-w-3xl mx-auto min-h-full">
      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} />
      ))}
      
      {showIndicator && <StreamingIndicator />}
      
      {/* Target anchor untuk auto-scroll */}
      <div ref={bottomRef} className="h-2" />
    </div>
  );
}