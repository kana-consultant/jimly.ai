import { useCallback } from 'react';
import { uuid } from '@/lib/uuid';
import { streamChatCompletion } from '@/pages/chat/logic/chat-api-client';
import { useChatStore } from '@/pages/chat/logic/chat-store';

export function useChatStream(chatId: string) {
  const addMessage = useChatStore((state) => state.addMessage);
  const appendToLastMessage = useChatStore((state) => state.appendToLastMessage);
  const setStreaming = useChatStore((state) => state.setStreaming);
  const messages = useChatStore((state) => state.messagesByChatId[chatId] ?? []);
  const isStreaming = useChatStore((state) => state.isStreaming);

  const sendMessage = useCallback(
    async (content: string) => {
      const now = new Date().toISOString();

      addMessage(chatId, { id: uuid(), sessionId: chatId, role: 'user', content, createdAt: now });
      addMessage(chatId, { id: uuid(), sessionId: chatId, role: 'assistant', content: '', createdAt: now });

      setStreaming(true);
      try {
        const history = [...messages, { role: 'user' as const, content }].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        for await (const chunk of streamChatCompletion(history)) {
          appendToLastMessage(chatId, chunk);
        }
      } finally {
        setStreaming(false);
      }
    },
    [chatId, messages, addMessage, appendToLastMessage, setStreaming],
  );

  return { messages, isStreaming, sendMessage };
}
