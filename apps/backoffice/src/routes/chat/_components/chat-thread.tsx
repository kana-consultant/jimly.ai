import { useState, useMemo, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/libs/utils';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getDisplayName } from '@/libs/display-name';
import { useSendMessage } from '@/routes/chat/_hooks/use-send-message';
import { useChatSessions } from '@/routes/chat/_hooks/use-chat-sessions';
import { useChatStore, chatStoreActions } from '@/routes/chat/_hooks/chat-store';
import { useMessageFeedback } from '@/routes/chat/_hooks/use-message-feedback';
import { deriveEmptyStateSuggestions, deriveActiveConversationSuggestions } from '@/routes/chat/_apis/derive-topics';
import { useScrollToBottom } from '@/routes/chat/_hooks/use-scroll-to-bottom';
import { chatRepository } from '@/routes/chat/_apis/chat-repository-instance';
import { ChatBubble, StreamingBubble } from '@/routes/chat/_components/chat-bubble';
import type { ChatMessage, FeedbackValue } from '@/routes/chat/types';
import { ThinkingUI } from '@/routes/chat/_components/streaming-indicator';
import { SuggestedTopics } from '@/routes/chat/_components/suggested-topics';
import { ChatInput } from '@/routes/chat/_components/chat-input';
import { ChatTopicNav } from '@/routes/chat/_components/chat-topic-nav';
import { Skeleton } from '@/components/ui/skeleton';

interface HistoryMessageListProps {
  messages: ChatMessage[];
  onRegenerate: (id: string) => void;
  onFeedback: (id: string, value: FeedbackValue) => void;
  onRemoveFeedback: (id: string) => void;
}

const HistoryMessageList = memo(function HistoryMessageList({
  messages,
  onRegenerate,
  onFeedback,
  onRemoveFeedback,
}: HistoryMessageListProps) {
  return (
    <AnimatePresence initial={false}>
      {messages.map((message) => (
        <motion.div
          key={message.id}
          id={`msg-${message.id}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChatBubble
            message={message}
            isStreaming={false}
            onRegenerate={onRegenerate}
            onFeedback={onFeedback}
            onRemoveFeedback={onRemoveFeedback}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );
});

function HistoryChatSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6 md:px-6 w-full max-w-3xl mx-auto">
      {[0.75, 1, 0.6, 0.85, 0.5].map((w, i) => (
        <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
          <Skeleton className="h-10 rounded-2xl" style={{ width: `${w * 100}%`, maxWidth: '480px' }} />
        </div>
      ))}
    </div>
  );
}

export function ChatThread() {
  const user = useCurrentUser();
  const { activeChatId, messages, isStreaming, isPending, error, sendMessage, retry, regenerate } = useSendMessage();
  const { sessions } = useChatSessions();
  const isLoadingMessages = useChatStore((state) => state.isLoadingMessages);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { submitFeedback, removeFeedback } = useMessageFeedback(activeChatId ?? '');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const streamingMessageId = useChatStore((state) => state.streamingMessageId);

  const historyMessages = useMemo(
    () => streamingMessageId ? messages.filter((m) => m.id !== streamingMessageId) : messages,
    [messages, streamingMessageId],
  );

  const hasMessages = activeChatId !== null && (historyMessages.length > 0 || isStreaming);
  const lastMessage = messages[messages.length - 1];
  const showThinking = isStreaming && lastMessage?.role === 'assistant' && lastMessage.content === '';
  const hasProcessing = messages.some((m) => m.role === 'assistant' && m.status === 'processing');

  const isWaiting = isPending || showThinking;
  const [showThinkingUI, setShowThinkingUI] = useState(false);
  const thinkingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isWaiting) {
      thinkingTimer.current = setTimeout(() => setShowThinkingUI(true), 300);
    } else {
      if (thinkingTimer.current) clearTimeout(thinkingTimer.current);
      setShowThinkingUI(false);
    }
    return () => { if (thinkingTimer.current) clearTimeout(thinkingTimer.current); };
  }, [isWaiting]);

  // Poll for processing messages
  useEffect(() => {
    if (!activeChatId || !hasProcessing || isStreaming) return;

    pollRef.current = setInterval(async () => {
      const updated = await chatRepository.listMessages(activeChatId).catch(() => null);
      if (!updated) return;
      chatStoreActions.setMessages(activeChatId, updated);
      const stillProcessing = updated.some((m) => m.role === 'assistant' && m.status === 'processing');
      if (!stillProcessing && pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 3000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [activeChatId, hasProcessing, isStreaming]);

  const topics = useMemo(
    () =>
      isStreaming
        ? []
        : hasMessages
          ? deriveActiveConversationSuggestions(messages)
          : deriveEmptyStateSuggestions(sessions),
    [isStreaming, hasMessages, messages, sessions],
  );
  const scrollRef = useScrollToBottom(isStreaming, messages.length, hasMessages);

  useEffect(() => {
    if (!hasMessages) setShowSuggestions(false);
  }, [hasMessages]);

  const suggestionsVisible = !hasMessages || showSuggestions;
  const displayName = getDisplayName(user);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div
        ref={scrollRef}
        className={cn(
          'flex-1 overflow-y-auto relative',
          hasMessages ? 'pb-52' : '',
        )}
      >
        <AnimatePresence mode="wait">
          {isLoadingMessages ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              <HistoryChatSkeleton />
            </motion.div>
          ) : !hasMessages ? (
            <motion.div
              key="empty"
              className="flex min-h-full flex-col items-center justify-center gap-6 px-4 py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              <div className="flex flex-col items-center gap-3">
                <img
                  src="/logo.png"
                  alt="jimly.ai"
                  className="w-20 h-20 rounded-full shadow-md"
                />
                <p className="text-lg text-primary font-medium">
                  Hello{displayName ? `, ${displayName}` : ''}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground text-center">
                  How can I assist you today?
                </h1>
              </div>

              <div className="w-full max-w-2xl flex flex-col items-center">
                <ChatInput
                  showSuggestions={false}
                  suggestions={
                    <div className="flex justify-center mt-3">
                      <SuggestedTopics topics={topics} onSelect={sendMessage} />
                    </div>
                  }
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              className="flex flex-col gap-4 px-4 py-6 md:px-6 w-full max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2 } }}
            >
              <HistoryMessageList
                messages={historyMessages}
                onRegenerate={regenerate}
                onFeedback={submitFeedback}
                onRemoveFeedback={removeFeedback}
              />

              {isStreaming && !showThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <StreamingBubble />
                </motion.div>
              )}

              {showThinkingUI && (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <ThinkingUI />
                </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hasMessages && <ChatTopicNav messages={messages} />}

      {hasMessages && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-linear-to-t from-background via-background to-transparent z-5" />
      )}

      {hasMessages && (
        <div className="absolute inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] mx-auto w-full max-w-2xl px-4 z-10 flex flex-col items-center">
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 mb-2 text-sm text-destructive"
              >
                <span className="flex-1">{error}</span>
                <button
                  onClick={retry}
                  className="shrink-0 font-medium underline underline-offset-2 hover:no-underline"
                >
                  Retry
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <ChatInput
            showSuggestions={showSuggestions}
            onToggleSuggestions={() => setShowSuggestions((prev) => !prev)}
            suggestions={
              suggestionsVisible ? (
                <div className="flex justify-center mt-3">
                  <SuggestedTopics topics={topics} onSelect={sendMessage} />
                </div>
              ) : null
            }
          />
        </div>
      )}
    </div>
  );
}
