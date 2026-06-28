import { Store, useStore } from '@tanstack/react-store';
import { uuid } from '@/lib/uuid';
import { streamChatCompletion } from '@/features/chat/logic/chat-api-client';
import { useChatStore } from '@/features/chat/logic/chat-store';
import type { ChatMessage, OutgoingMessage } from '@/types/chat';

const EMPTY_MESSAGES: ChatMessage[] = [];
const WORD_DELAY_MS = 35;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const streamErrorStore = new Store<{ error: string | null }>({ error: null });

export function useChatStream() {
  const activeChatId = useChatStore((state) => state.activeChatId);
  const addMessage = useChatStore((state) => state.addMessage);
  const appendToLastMessage = useChatStore((state) => state.appendToLastMessage);
  const removeLastMessage = useChatStore((state) => state.removeLastMessage);
  const setStreaming = useChatStore((state) => state.setStreaming);
  const messages = useChatStore((state) => state.messagesByChatId[activeChatId ?? ''] ?? EMPTY_MESSAGES);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const error = useStore(streamErrorStore, (s) => s.error);

  async function streamAssistantReply(chatId: string, history: OutgoingMessage[]) {
    addMessage(chatId, { id: uuid(), sessionId: chatId, role: 'assistant', content: '', createdAt: new Date().toISOString() });
    setStreaming(true);
    streamErrorStore.setState(() => ({ error: null }));
    try {
      let fullContent = '';
      let buffer = '';
      let streamDone = false;
      let wakeDrain: (() => void) | null = null;

      const drain = async () => {
        while (true) {
          if (buffer.length > 0) {
            const piece = /^\s*\S*\s*/.exec(buffer)![0] || buffer;
            buffer = buffer.slice(piece.length);
            appendToLastMessage(chatId, piece);
            await sleep(WORD_DELAY_MS);
            continue;
          }
          if (streamDone) return;
          await new Promise<void>((resolve) => { wakeDrain = resolve; });
        }
      };
      const drainPromise = drain();

      for await (const chunk of streamChatCompletion(chatId, history)) {
        fullContent += chunk;
        buffer += chunk;
        wakeDrain?.();
        wakeDrain = null;
      }
      streamDone = true;
      wakeDrain?.();
      await drainPromise;

      return fullContent;
    } catch {
      removeLastMessage(chatId);
      streamErrorStore.setState(() => ({ error: 'Something went wrong while replying. Please try again.' }));
      return null;
    } finally {
      setStreaming(false);
    }
  }

  return { activeChatId, messages, isStreaming, error, streamAssistantReply };
}
