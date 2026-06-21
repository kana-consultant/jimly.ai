import { useCallback, useRef } from 'react';
import { uuid } from '@/lib/uuid';
import { useChatStore } from '@/features/chat/logic/chat-store';
import { useChatStream } from '@/features/chat/logic/use-chat-stream';
import { generateChatTitle } from '@/features/chat/logic/generate-chat-title';
import { chatRepository } from '@/features/chat/logic/chat-repository-instance';
import type { OutgoingMessage } from '@/types/chat';

export function useSendMessage() {
  const { activeChatId, messages, isStreaming, error, streamAssistantReply } = useChatStream();
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const addSession = useChatStore((state) => state.addSession);
  const addMessage = useChatStore((state) => state.addMessage);
  const lastAttemptRef = useRef<{ chatId: string; history: OutgoingMessage[] } | null>(null);

  const replyAndPersist = useCallback(
    async (chatId: string, history: OutgoingMessage[]) => {
      lastAttemptRef.current = { chatId, history };
      const fullContent = await streamAssistantReply(chatId, history);
      if (fullContent === null) return;
      await chatRepository.addMessage({
        id: uuid(),
        sessionId: chatId,
        role: 'assistant',
        content: fullContent,
        createdAt: new Date().toISOString(),
      });
    },
    [streamAssistantReply],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const isNewChat = activeChatId === null;
      const chatId = activeChatId ?? uuid();
      const now = new Date().toISOString();

      if (isNewChat) setActiveChat(chatId);

      const userMessage = { id: uuid(), sessionId: chatId, role: 'user' as const, content, createdAt: now };
      addMessage(chatId, userMessage);

      if (isNewChat) {
        const session = { id: chatId, title: generateChatTitle(content), pinned: false, createdAt: now, updatedAt: now };
        addSession({ ...session, userId: '' });
        await chatRepository.createSession(session);
      } else {
        await chatRepository.updateSession(chatId, { updatedAt: now });
      }
      await chatRepository.addMessage(userMessage);

      const history = [...messages, { role: 'user' as const, content }].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      await replyAndPersist(chatId, history);
    },
    [activeChatId, messages, addMessage, addSession, setActiveChat, replyAndPersist],
  );

  const retry = useCallback(() => {
    if (!lastAttemptRef.current) return;
    const { chatId, history } = lastAttemptRef.current;
    void replyAndPersist(chatId, history);
  }, [replyAndPersist]);

  return { activeChatId, messages, isStreaming, error, sendMessage, retry };
}
