import { useCallback, useRef } from 'react';
import { uuid } from '@/lib/uuid';
import { useChatStore } from '@/features/chat/logic/chat-store';
import { useChatStream } from '@/features/chat/logic/use-chat-stream';
import { generateChatTitle } from '@/features/chat/logic/generate-chat-title';
import { useChatRepository } from '@/features/chat/logic/chat-repository-context';
import type { ChatRepository } from '@/services/chat-repository';
import type { ChatMessage, NewChatSession, OutgoingMessage } from '@/types/chat';

async function persistTurn(
  repo: ChatRepository,
  chatId: string,
  userMessage: ChatMessage,
  now: string,
  newSession?: NewChatSession,
) {
  if (newSession) {
    await repo.createSession(newSession);
  } else {
    await repo.updateSession(chatId, { updatedAt: now });
  }
  await repo.addMessage(userMessage);
}

export function useSendMessage() {
  const repo = useChatRepository();
  const { activeChatId, messages, isStreaming, error, streamAssistantReply } = useChatStream();
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const addSession = useChatStore((state) => state.addSession);
  const addMessage = useChatStore((state) => state.addMessage);
  const lastAttemptRef = useRef<{ chatId: string; history: OutgoingMessage[] } | null>(null);

  // The server persists the assistant's reply itself (send-message.ts) once
  // the stream completes — the client only renders it, never re-posts it.
  const requestAssistantReply = useCallback(
    async (chatId: string, history: OutgoingMessage[]) => {
      lastAttemptRef.current = { chatId, history };
      await streamAssistantReply(chatId, history);
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

      let newSession: NewChatSession | undefined;
      if (isNewChat) {
        newSession = { id: chatId, title: generateChatTitle(content), pinned: false, createdAt: now, updatedAt: now };
        addSession({ ...newSession, userId: '' });
      }
      await persistTurn(repo, chatId, userMessage, now, newSession);

      const history = [...messages, { role: 'user' as const, content }].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      await requestAssistantReply(chatId, history);
    },
    [activeChatId, messages, addMessage, addSession, setActiveChat, requestAssistantReply, repo],
  );

  const retry = useCallback(() => {
    if (!lastAttemptRef.current) return;
    const { chatId, history } = lastAttemptRef.current;
    void requestAssistantReply(chatId, history);
  }, [requestAssistantReply]);

  return { activeChatId, messages, isStreaming, error, sendMessage, retry };
}
