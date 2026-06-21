import { useCallback, useState } from 'react';
import { uuid } from '@/lib/uuid';
import { streamChatCompletion } from '@/pages/chat/logic/chat-api-client';
import { useChatStore } from '@/pages/chat/logic/chat-store';
import type { ChatMessage, OutgoingMessage } from '@/types/chat';

const EMPTY_MESSAGES: ChatMessage[] = [];

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
        for await (const chunk of streamChatCompletion(history)) {
          fullContent += chunk;
          appendToLastMessage(chatId, chunk);
        }
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
