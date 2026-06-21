import { useCallback } from 'react';
import { uuid } from '@/lib/uuid';
import { streamChatCompletion } from '@/pages/chat/logic/chat-api-client';
import { useChatStore } from '@/pages/chat/logic/chat-store';
import { generateChatTitle } from '@/pages/chat/logic/generate-chat-title';
import { chatRepository } from '@/pages/chat/logic/chat-repository-instance';

export function useChatStream() {
  const activeChatId = useChatStore((state) => state.activeChatId);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const addSession = useChatStore((state) => state.addSession);
  const addMessage = useChatStore((state) => state.addMessage);
  const appendToLastMessage = useChatStore((state) => state.appendToLastMessage);
  const setStreaming = useChatStore((state) => state.setStreaming);
  const messages = useChatStore((state) => state.messagesByChatId[activeChatId ?? ''] ?? []);
  const isStreaming = useChatStore((state) => state.isStreaming);

  const sendMessage = useCallback(
    async (content: string) => {
      const isNewChat = activeChatId === null;
      const chatId = activeChatId ?? uuid();
      const now = new Date().toISOString();

      if (isNewChat) setActiveChat(chatId);

      const userMessage = { id: uuid(), sessionId: chatId, role: 'user' as const, content, createdAt: now };
      addMessage(chatId, userMessage);
      addMessage(chatId, { id: uuid(), sessionId: chatId, role: 'assistant', content: '', createdAt: now });

      setStreaming(true);
      try {
        if (isNewChat) {
          const session = { id: chatId, userId: '', title: generateChatTitle(content), createdAt: now, updatedAt: now };
          addSession(session);
          await chatRepository.createSession(session);
        } else {
          await chatRepository.updateSession(chatId, { updatedAt: now });
        }
        await chatRepository.addMessage(userMessage);

        const history = [...messages, { role: 'user' as const, content }].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        let fullContent = '';
        for await (const chunk of streamChatCompletion(history)) {
          fullContent += chunk;
          appendToLastMessage(chatId, chunk);
        }

        await chatRepository.addMessage({
          id: uuid(),
          sessionId: chatId,
          role: 'assistant',
          content: fullContent,
          createdAt: new Date().toISOString(),
        });
      } finally {
        setStreaming(false);
      }
    },
    [activeChatId, messages, addMessage, addSession, appendToLastMessage, setActiveChat, setStreaming],
  );

  return { activeChatId, messages, isStreaming, sendMessage };
}
