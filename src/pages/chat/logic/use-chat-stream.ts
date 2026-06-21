import { useCallback, useRef, useState } from 'react';
import { uuid } from '@/lib/uuid';
import { streamChatCompletion } from '@/pages/chat/logic/chat-api-client';
import { useChatStore } from '@/pages/chat/logic/chat-store';
import { generateChatTitle } from '@/pages/chat/logic/generate-chat-title';
import { chatRepository } from '@/pages/chat/logic/chat-repository-instance';

interface OutgoingMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function useChatStream() {
  const activeChatId = useChatStore((state) => state.activeChatId);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const addSession = useChatStore((state) => state.addSession);
  const addMessage = useChatStore((state) => state.addMessage);
  const appendToLastMessage = useChatStore((state) => state.appendToLastMessage);
  const removeLastMessage = useChatStore((state) => state.removeLastMessage);
  const setStreaming = useChatStore((state) => state.setStreaming);
  const messages = useChatStore((state) => state.messagesByChatId[activeChatId ?? ''] ?? []);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const [error, setError] = useState<string | null>(null);
  const lastAttemptRef = useRef<{ chatId: string; history: OutgoingMessage[] } | null>(null);

  const streamAssistantReply = useCallback(
    async (chatId: string, history: OutgoingMessage[]) => {
      addMessage(chatId, { id: uuid(), sessionId: chatId, role: 'assistant', content: '', createdAt: new Date().toISOString() });
      lastAttemptRef.current = { chatId, history };
      setStreaming(true);
      setError(null);
      try {
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
        lastAttemptRef.current = null;
      } catch {
        removeLastMessage(chatId);
        setError('Something went wrong while replying. Please try again.');
      } finally {
        setStreaming(false);
      }
    },
    [addMessage, appendToLastMessage, removeLastMessage, setStreaming],
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
        const session = {
          id: chatId,
          userId: '',
          title: generateChatTitle(content),
          pinned: false,
          createdAt: now,
          updatedAt: now,
        };
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

      await streamAssistantReply(chatId, history);
    },
    [activeChatId, messages, addMessage, addSession, setActiveChat, streamAssistantReply],
  );

  const retry = useCallback(() => {
    if (!lastAttemptRef.current) return;
    const { chatId, history } = lastAttemptRef.current;
    void streamAssistantReply(chatId, history);
  }, [streamAssistantReply]);

  return { activeChatId, messages, isStreaming, error, sendMessage, retry };
}
