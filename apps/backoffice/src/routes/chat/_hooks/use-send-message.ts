import { uuid } from '@/libs/uuid';
import { useChatStore, chatStoreActions } from '@/routes/chat/_hooks/chat-store';
import { useChatStream, streamAssistantReply } from '@/routes/chat/_hooks/use-chat-stream';
import { generateChatTitle } from '@/routes/chat/_apis/generate-chat-title';
import { useChatRepository } from '@/routes/chat/_apis/chat-repository-context';
import type { ChatRepository } from '@/routes/chat/_apis/chat-repository';
import type { ChatMessage, NewChatSession } from '@/routes/chat/types';

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
}

async function requestAssistantReply(chatId: string, content: string) {
  abortController?.abort();
  abortController = new AbortController();
  chatStoreActions.setLastAttempt({ chatId, content });
  await streamAssistantReply(chatId, content, abortController.signal);
}

export function useSendMessage() {
  const repo = useChatRepository();
  const { activeChatId, messages, isStreaming, isPending, error } = useChatStream();
  const lastAttempt = useChatStore((state) => state.lastAttempt);


  async function sendMessage(content: string) {
    const isNewChat = activeChatId === null;
    const chatId = activeChatId ?? uuid();
    const now = new Date().toISOString();

    if (isNewChat) chatStoreActions.setActiveChat(chatId);

    const userMessage = { id: uuid(), sessionId: chatId, role: 'user' as const, content, createdAt: now };
    chatStoreActions.addMessage(chatId, userMessage);

    let newSession: NewChatSession | undefined;
    if (isNewChat) {
      newSession = { id: chatId, title: generateChatTitle(content), pinned: false, createdAt: now, updatedAt: now };
      chatStoreActions.addSession({ ...newSession, userId: '' });
    }
    chatStoreActions.setPending(true);
    try {
      await persistTurn(repo, chatId, userMessage, now, newSession);
    } finally {
      chatStoreActions.setPending(false);
    }
    await requestAssistantReply(chatId, content);
  }

  function retry() {
    if (!lastAttempt) return;
    void requestAssistantReply(lastAttempt.chatId, lastAttempt.content);
  }

  return { activeChatId, messages, isStreaming, isPending, error, sendMessage, retry };
}
