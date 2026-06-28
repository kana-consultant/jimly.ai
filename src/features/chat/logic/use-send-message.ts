import { Store, useStore } from '@tanstack/react-store';
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

const lastAttemptStore = new Store<{ chatId: string; history: OutgoingMessage[] } | null>(null);

export function useSendMessage() {
  const repo = useChatRepository();
  const { activeChatId, messages, isStreaming, error, streamAssistantReply } = useChatStream();
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const addSession = useChatStore((state) => state.addSession);
  const addMessage = useChatStore((state) => state.addMessage);

  async function replyAndPersist(chatId: string, history: OutgoingMessage[]) {
    lastAttemptStore.setState(() => ({ chatId, history }));
    const fullContent = await streamAssistantReply(chatId, history);
    if (fullContent === null) return;
    await repo.addMessage({
      id: uuid(),
      sessionId: chatId,
      role: 'assistant',
      content: fullContent,
      createdAt: new Date().toISOString(),
    });
  }

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

    const history = [...messages, { role: 'user' as const, content }].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await replyAndPersist(chatId, history);
  }

  function retry() {
    const lastAttempt = lastAttemptStore.state;
    if (!lastAttempt) return;
    void replyAndPersist(lastAttempt.chatId, lastAttempt.history);
  }

  return { activeChatId, messages, isStreaming, error, sendMessage, retry };
}
