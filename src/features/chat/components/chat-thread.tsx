import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useSendMessage } from '@/features/chat/logic/use-send-message';
import { useChatSessions } from '@/features/chat/logic/use-chat-sessions';
import type { ChatSession } from '@/types/chat';
import { ChatBubble } from '@/features/chat/components/chat-bubble';
import { StreamingIndicator } from '@/features/chat/components/streaming-indicator';
import { SuggestedTopics } from '@/features/chat/components/suggested-topics';
import { ChatInput } from '@/features/chat/components/chat-input';

function formatDisplayName(email: string): string {
  const name = email.slice(0, email.indexOf('@'));
  return name
    .split(/[._-]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

const INTENT_TOPICS: Record<string, string[]> = {
  research: ['Competitors', 'Market trends', 'Industry reports'],
  brainstorm: ['Alternatives', 'Creative ideas', 'New approaches'],
  summarize: ['Key points', 'Outline', 'Extract insights'],
  code: ['Debug this', 'Refactor', 'Write tests'],
  write: ['Draft reply', 'Rewrite', 'Expand this'],
  explain: ['Simplify', 'Examples', 'Step-by-step'],
  compare: ['Pros and cons', 'Alternatives', 'Trade-offs'],
  analyze: ['Key insights', 'Root causes', 'Implications'],
};

const DEFAULT_TOPICS = ['Research', 'Brainstorm', 'Summarize', 'Check facts'];

function truncateWords(text: string, maxWords = 2): string {
  const words = text.trim().split(/\s+/);
  return words.length <= maxWords ? text.trim() : words.slice(0, maxWords).join(' ');
}

function deriveTopics(messages: { role: string; content: string }[], sessions: ChatSession[]): string[] {
  if (!messages.length) {
    const recentTitles = sessions
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 4)
      .map((s) => truncateWords(s.title));
    return recentTitles.length ? recentTitles : DEFAULT_TOPICS;
  }

  const userMessages = messages.filter((m) => m.role === 'user');
  if (!userMessages.length) return DEFAULT_TOPICS;

  const lastUser = userMessages[userMessages.length - 1].content.toLowerCase();
  for (const [intent, topics] of Object.entries(INTENT_TOPICS)) {
    if (lastUser.includes(intent)) return topics;
  }

  if (lastUser.includes('?')) {
    return ['Tell more', 'Simplify', 'Examples', 'Step-by-step'];
  }

  return ['Explore more', 'Details', 'Examples', 'Alternatives'];
}

export function ChatThread() {
  const user = useCurrentUser();
  const { activeChatId, messages, isStreaming, sendMessage } = useSendMessage();
  const { sessions } = useChatSessions();

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(messages.length);

  const [showSuggestions, setShowSuggestions] = useState(false);

  const hasMessages = activeChatId !== null && messages.length > 0;
  const lastMessage = messages[messages.length - 1];
  const showThinking = isStreaming && lastMessage?.role === 'assistant' && lastMessage.content === '';

  const topics = useMemo(() => deriveTopics(messages, sessions), [messages, sessions]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  // New message appended (user message, or assistant placeholder) -> follow to bottom
  useEffect(() => {
    if (hasMessages) {
      const isNewMessage = messages.length > prevLenRef.current;
      prevLenRef.current = messages.length;
      if (isNewMessage) {
        scrollToBottom('smooth');
      }
    } else {
      prevLenRef.current = messages.length;
    }
  }, [messages.length, hasMessages, scrollToBottom]);

  // Keep following the bottom as streamed content grows, no re-jump/re-center
  useEffect(() => {
    if (isStreaming && hasMessages && lastMessage?.content) {
      scrollToBottom('smooth');
    }
  }, [lastMessage?.content, isStreaming, hasMessages, scrollToBottom]);

  useEffect(() => {
    if (!hasMessages) {
      setShowSuggestions(false);
    }
  }, [hasMessages]);

  const handleTopicSelect = useCallback(
    (topic: string) => {
      sendMessage(topic);
    },
    [sendMessage],
  );

  const handleToggleSuggestions = useCallback(() => {
    setShowSuggestions((prev) => !prev);
  }, []);

  const suggestionsVisible = !hasMessages || showSuggestions;
  const displayName = user?.email ? formatDisplayName(user.email) : '';

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Messages area */}
      <div
        ref={scrollRef}
        className={cn(
          'flex-1 overflow-y-auto scroll-smooth relative',
          hasMessages ? 'pb-52' : '',
        )}
      >
        <AnimatePresence mode="wait">
          {!hasMessages ? (
            <motion.div
              key="empty"
              className="flex flex-col items-center min-h-full pt-[16vh] px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              <div className="flex flex-col items-center gap-3">
                <img
                  src="/jimly.ai-logo.png"
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
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              className="flex flex-col gap-4 px-4 py-6 md:px-6 w-full max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2 } }}
            >
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ChatBubble message={message} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {showThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <StreamingIndicator />
                </motion.div>
              )}

              <div ref={bottomRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom fade - messages fade out as they pass under the input, gradient spans down to the bottom edge */}
      {hasMessages && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-background via-background to-transparent z-[5]" />
      )}

      {/* Input - absolutely positioned, animates between center and bottom */}
      <div
        className="absolute inset-x-0 mx-auto w-full max-w-2xl px-4 z-10 flex flex-col items-center"
        style={{
          bottom: hasMessages ? '1.5rem' : '50%',
          transform: hasMessages ? 'translateY(0)' : 'translateY(50%)',
          transition: 'bottom 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <ChatInput
          showSuggestions={hasMessages ? showSuggestions : false}
          onToggleSuggestions={hasMessages ? handleToggleSuggestions : undefined}
          suggestions={
            suggestionsVisible ? (
              <div className="flex justify-center mt-3">
                <SuggestedTopics topics={topics} onSelect={handleTopicSelect} />
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
}
