import { uuid } from '@/libs/uuid';
import { useChatStore } from '@/routes/chat/_hooks/chat-store';
import { useChatStream, streamAssistantReply } from '@/routes/chat/_hooks/use-chat-stream';
import { generateChatTitle } from '@/routes/chat/_apis/generate-chat-title';
import { useChatRepository } from '@/routes/chat/_apis/chat-repository-context';
import type { ChatRepository } from '@/routes/chat/_apis/chat-repository';
import type { ChatMessage, NewChatSession } from '@/routes/chat/types';

let lastAttempt: { chatId: string; content: string } | null = null;
let abortController: AbortController | null = null;

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

async function requestAssistantReply(chatId: string, content: string) {
  abortController?.abort();
  abortController = new AbortController();
  lastAttempt = { chatId, content };
  await streamAssistantReply(chatId, content, abortController.signal);
}

export function useSendMessage() {
  const repo = useChatRepository();
  const { activeChatId, messages, isStreaming, error } = useChatStream();
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const addSession = useChatStore((state) => state.addSession);
  const addMessage = useChatStore((state) => state.addMessage);

  // The server persists the assistant's reply itself (send-message.ts) once
  // the stream completes — the client only renders it, never re-posts it.

  async function sendMessage(content: string) {
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
    await requestAssistantReply(chatId, content);
  }

  function retry() {
    if (!lastAttempt) return;
    void requestAssistantReply(lastAttempt.chatId, lastAttempt.content);
  }

  return { activeChatId, messages, isStreaming, error, sendMessage, retry };
}
