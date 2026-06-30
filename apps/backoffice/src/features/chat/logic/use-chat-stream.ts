import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import { uuid } from '@/lib/uuid';
import { streamChatCompletion } from '@/features/chat/logic/chat-api-client';
import { useChatStore, chatStoreActions } from '@/features/chat/logic/chat-store';
import type { ChatMessage } from '@/types/chat';

const EMPTY_MESSAGES: ChatMessage[] = [];
const errorStore = new Store<string | null>(null);

export async function streamAssistantReply(chatId: string, content: string, signal?: AbortSignal) {
  chatStoreActions.addMessage(chatId, {
    id: uuid(),
    sessionId: chatId,
    role: 'assistant',
    content: '',
    createdAt: new Date().toISOString(),
  });
  chatStoreActions.setStreaming(true);
  errorStore.setState(() => null);
  try {
    for await (const chunk of streamChatCompletion(chatId, content, signal)) {
      chatStoreActions.appendToLastMessage(chatId, chunk);
    }
  } catch (err) {
    chatStoreActions.removeLastMessage(chatId);
    if (!(err instanceof Error && err.name === 'AbortError')) {
      errorStore.setState(() => 'Something went wrong while replying. Please try again.');
    }
  } finally {
    chatStoreActions.setStreaming(false);
  }
}

export function useChatStream() {
  const activeChatId = useChatStore((state) => state.activeChatId);
  const messages = useChatStore((state) => state.messagesByChatId[activeChatId ?? ''] ?? EMPTY_MESSAGES);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const error = useStore(errorStore, (s) => s);

  return { activeChatId, messages, isStreaming, error };
}
