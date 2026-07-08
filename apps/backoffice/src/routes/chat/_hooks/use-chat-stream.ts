import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import { uuid } from '@/libs/uuid';
import { streamChatCompletion } from '@/routes/chat/_apis/chat-api-client';
import { useChatStore, chatStoreActions } from '@/routes/chat/_hooks/chat-store';
import type { ChatMessage } from '@/routes/chat/types';

const EMPTY_MESSAGES: ChatMessage[] = [];
const errorStore = new Store<string | null>(null);

export async function streamAssistantReply(chatId: string, content: string, signal?: AbortSignal) {
  chatStoreActions.addMessage(chatId, {
    id: uuid(),
    sessionId: chatId,
    role: 'assistant',
    content: '',
    status: 'completed',
    createdAt: new Date().toISOString(),
  });
  chatStoreActions.setStreaming(true);
  errorStore.setState(() => null);
  try {
    for await (const chunk of streamChatCompletion(chatId, content, signal)) {
      const tokens = chunk.split(/(?<=\s)|(?=\s)/);
      for (const token of tokens) {
        if (!token) continue;
        chatStoreActions.appendToLastMessage(chatId, token);
        await new Promise<void>((r) => setTimeout(r, 0));
      }
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
  const isPending = useChatStore((state) => state.isPending);
  const error = useStore(errorStore, (s) => s);

  return { activeChatId, messages, isStreaming, isPending, error };
}
