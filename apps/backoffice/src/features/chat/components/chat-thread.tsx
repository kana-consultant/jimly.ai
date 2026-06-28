import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getDisplayName } from '@/lib/display-name';
import { useSendMessage } from '@/features/chat/logic/use-send-message';
import { useChatSessions } from '@/features/chat/logic/use-chat-sessions';
import type { ChatSession } from '@/types/chat';
import { ChatBubble } from '@/features/chat/components/chat-bubble';
import { StreamingIndicator } from '@/features/chat/components/streaming-indicator';
import { SuggestedTopics } from '@/features/chat/components/suggested-topics';
import { ChatInput } from '@/features/chat/components/chat-input';
import { ChatTopicNav } from '@/features/chat/components/chat-topic-nav';

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

  const lastUser = userMessages[userMessages.length - 1]!.content.toLowerCase();
  for (const [intent, topics] of Object.entries(INTENT_TOPICS)) {
    if (lastUser.includes(intent)) return topics;
  }

  if (lastUser.includes('?')) {
    return ['Tell more', 'Simplify', 'Examples', 'Step-by-step'];
  }

  return ['Explore more', 'Details', 'Examples', 'Alternatives'];
}

let scrollEl: HTMLDivElement | null = null;
let prevLen = 0;

const showSuggestionsStore = new Store(false);

function scrollToBottom(behavior: ScrollBehavior = 'auto') {
  const container = scrollEl;
  if (container) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }
}

export function ChatThread() {
  const user = useCurrentUser();
  const { activeChatId, messages, isStreaming, sendMessage } = useSendMessage();
  const { sessions } = useChatSessions();
  const showSuggestions = useStore(showSuggestionsStore, (s) => s);

  const hasMessages = activeChatId !== null && messages.length > 0;
  const lastMessage = messages[messages.length - 1];
  const showThinking = isStreaming && lastMessage?.role === 'assistant' && lastMessage.content === '';

  const topics = deriveTopics(messages, sessions);

  requestAnimationFrame(() => {
    if (hasMessages) {
      const isNewMessage = messages.length > prevLen;
      prevLen = messages.length;
      if (isNewMessage) {
        scrollToBottom('auto');
      }
    } else {
      prevLen = messages.length;
      if (showSuggestionsStore.state) {
        showSuggestionsStore.setState(() => false);
      }
    }

    if (isStreaming && hasMessages && lastMessage?.content) {
      const container = scrollEl;
      if (container) {
        const threshold = 150;
        const isUserNearBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;

        if (isUserNearBottom) {
          container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });
        }
      }
    }
  });

  function handleTopicSelect(topic: string) {
    sendMessage(topic);
  }

  function handleToggleSuggestions() {
    showSuggestionsStore.setState((prev) => !prev);
  }

  const suggestionsVisible = !hasMessages || showSuggestions;
  const displayName = getDisplayName(user);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div
        ref={(el) => {
          scrollEl = el;
        }}
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
                      <SuggestedTopics topics={topics} onSelect={handleTopicSelect} />
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
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    id={`msg-${message.id}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChatBubble message={message} />
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
            onToggleSuggestions={handleToggleSuggestions}
            suggestions={
              suggestionsVisible ? (
                <div className="flex justify-center mt-3">
                  <SuggestedTopics topics={topics} onSelect={handleTopicSelect} />
                </div>
              ) : null
            }
          />
        </div>
      )}
    </div>
  );
}
