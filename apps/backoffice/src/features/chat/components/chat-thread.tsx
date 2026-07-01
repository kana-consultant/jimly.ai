import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getDisplayName } from '@/lib/display-name';
import { useSendMessage } from '@/features/chat/logic/use-send-message';
import { useChatSessions } from '@/features/chat/logic/use-chat-sessions';
import { deriveTopics } from '@/features/chat/logic/derive-topics';
import { useScrollToBottom } from '@/features/chat/logic/use-scroll-to-bottom';
import type { ChatSession } from '@/types/chat';
import { ChatBubble } from '@/features/chat/components/chat-bubble';
import { StreamingIndicator } from '@/features/chat/components/streaming-indicator';
import { SuggestedTopics } from '@/features/chat/components/suggested-topics';
import { ChatInput } from '@/features/chat/components/chat-input';
import { ChatTopicNav } from '@/features/chat/components/chat-topic-nav';

export function ChatThread() {
  const user = useCurrentUser();
  const { activeChatId, messages, isStreaming, sendMessage } = useSendMessage();
  const { sessions } = useChatSessions();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const hasMessages = activeChatId !== null && messages.length > 0;
  const lastMessage = messages[messages.length - 1];
  const showThinking = isStreaming && lastMessage?.role === 'assistant' && lastMessage.content === '';

  const topics = useMemo(() => deriveTopics(messages, sessions), [messages, sessions]);
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
          {!hasMessages ? (
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
              <AnimatePresence initial={false}>
                {messages.map((message, i) => (
                  <motion.div
                    key={message.id}
                    id={`msg-${message.id}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChatBubble
                      message={message}
                      isStreaming={isStreaming && i === messages.length - 1 && message.role === 'assistant'}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {showThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <StreamingIndicator />
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
        <div className="absolute inset-x-0 bottom-6 mx-auto w-full max-w-2xl px-4 z-10 flex flex-col items-center">
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
