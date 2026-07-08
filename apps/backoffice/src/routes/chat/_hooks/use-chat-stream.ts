import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import { uuid } from '@/libs/uuid';
import { streamChatCompletion } from '@/routes/chat/_apis/chat-api-client';
import { useChatStore, chatStoreActions } from '@/routes/chat/_hooks/chat-store';
import type { ChatMessage } from '@/routes/chat/types';

const EMPTY_MESSAGES: ChatMessage[] = [];
const errorStore = new Store<string | null>(null);

export async function streamAssistantReply(chatId: string, content: string, signal?: AbortSignal) {
  const msgId = uuid();
  chatStoreActions.addMessage(chatId, {
    id: msgId,
    sessionId: chatId,
    role: 'assistant',
    content: '',
    status: 'completed',
    createdAt: new Date().toISOString(),
  });
  chatStoreActions.setStreamingMessageId(msgId);
  chatStoreActions.setStreamingContent('');
  chatStoreActions.setStreaming(true);
  errorStore.setState(() => null);

  let buffer = '';
  let rafId: number | null = null;

  function flushBuffer() {
    chatStoreActions.setStreamingContent(buffer);
    rafId = null;
  }

  function scheduleFlush() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(flushBuffer);
  }

  function abortStream(message: string) {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    chatStoreActions.removeLastMessage(chatId);
    chatStoreActions.setStreamingContent(null);
    chatStoreActions.setStreamingMessageId(null);
    errorStore.setState(() => message);
  }

  try {
    for await (const chunk of streamChatCompletion(chatId, content, signal)) {
      buffer += chunk;
      scheduleFlush();
    }
  } catch (err) {
    if (!(err instanceof Error && err.name === 'AbortError')) {
      abortStream('Something went wrong while replying. Please try again.');
    } else {
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
      chatStoreActions.setStreamingContent(null);
      chatStoreActions.setStreamingMessageId(null);
    }
    return;
  } finally {
    chatStoreActions.setStreaming(false);
  }

  if (!buffer) {
    abortStream('AI returned an empty response. Please try again.');
    return;
  }

  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  chatStoreActions.updateMessage(chatId, msgId, { content: buffer });
  chatStoreActions.setStreamingContent(null);
  chatStoreActions.setStreamingMessageId(null);
}

export function useChatStream() {
  const activeChatId = useChatStore((state) => state.activeChatId);
  const messages = useChatStore((state) => state.messagesByChatId[activeChatId ?? ''] ?? EMPTY_MESSAGES);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const isPending = useChatStore((state) => state.isPending);
  const error = useStore(errorStore, (s) => s);

  return { activeChatId, messages, isStreaming, isPending, error };
}
