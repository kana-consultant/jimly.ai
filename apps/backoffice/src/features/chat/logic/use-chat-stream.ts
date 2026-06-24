import { useCallback, useState } from 'react';
import { uuid } from '@/lib/uuid';
import { streamChatCompletion } from '@/features/chat/logic/chat-api-client';
import { useChatStore } from '@/features/chat/logic/chat-store';
import type { ChatMessage, OutgoingMessage } from '@/types/chat';

const EMPTY_MESSAGES: ChatMessage[] = [];
const WORD_DELAY_MS = 35;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function useChatStream() {
  const activeChatId = useChatStore((state) => state.activeChatId);
  const addMessage = useChatStore((state) => state.addMessage);
  const appendToLastMessage = useChatStore((state) => state.appendToLastMessage);
  const removeLastMessage = useChatStore((state) => state.removeLastMessage);
  const setStreaming = useChatStore((state) => state.setStreaming);
  const messages = useChatStore((state) => state.messagesByChatId[activeChatId ?? ''] ?? EMPTY_MESSAGES);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const [error, setError] = useState<string | null>(null);

  const streamAssistantReply = useCallback(
    async (chatId: string, history: OutgoingMessage[]) => {
      addMessage(chatId, { id: uuid(), sessionId: chatId, role: 'assistant', content: '', createdAt: new Date().toISOString() });
      setStreaming(true);
      setError(null);
      try {
        let fullContent = '';
        let buffer = '';
        let streamDone = false;
        const waker: { wake: (() => void) | null } = { wake: null };

        const drain = async () => {
          while (true) {
            if (buffer.length > 0) {
              const piece = /^\s*\S*\s*/.exec(buffer)![0] || buffer;
              buffer = buffer.slice(piece.length);
              appendToLastMessage(chatId, piece);
              await sleep(WORD_DELAY_MS);
              continue;
            }
            if (streamDone) return;
            await new Promise<void>((resolve) => {
              waker.wake = resolve;
            });
          }
        };
        const drainPromise = drain();

        for await (const chunk of streamChatCompletion(chatId, history)) {
          fullContent += chunk;
          buffer += chunk;
          waker.wake?.();
          waker.wake = null;
        }
        streamDone = true;
        waker.wake?.();
        await drainPromise;

        return fullContent;
      } catch {
        removeLastMessage(chatId);
        setError('Something went wrong while replying. Please try again.');
        return null;
      } finally {
        setStreaming(false);
      }
    },
    [addMessage, appendToLastMessage, removeLastMessage, setStreaming],
  );

  return { activeChatId, messages, isStreaming, error, streamAssistantReply };
}
