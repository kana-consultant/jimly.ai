import { useEffect } from 'react';
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

  if (import.meta.env.DEV) performance.mark(`stream-start-${chatId}`);

  try {
    let firstChunk = true;
    for await (const chunk of streamChatCompletion(chatId, content, signal)) {
      if (import.meta.env.DEV && firstChunk) {
        performance.mark(`first-token-${chatId}`);
        performance.measure('TTFT', `stream-start-${chatId}`, `first-token-${chatId}`);
        const ttft = performance.getEntriesByName('TTFT').at(-1)?.duration ?? 0;
        console.debug(`[perf] Time-to-first-token: ${ttft.toFixed(0)}ms`);
        firstChunk = false;
      }
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

  if (import.meta.env.DEV) {
    performance.mark(`stream-end-${chatId}`);
    performance.measure('StreamDuration', `stream-start-${chatId}`, `stream-end-${chatId}`);
    const dur = performance.getEntriesByName('StreamDuration').at(-1)?.duration ?? 0;
    console.debug(`[perf] Total stream duration: ${dur.toFixed(0)}ms`);
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

  useEffect(() => {
    errorStore.setState(() => null);
  }, [activeChatId]);

  return { activeChatId, messages, isStreaming, isPending, error };
}

export function useChatError() {
  return useStore(errorStore, (s) => s);
}
