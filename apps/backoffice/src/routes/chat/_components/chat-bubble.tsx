import { memo, useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/routes/chat/_hooks/chat-store';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ThumbsUp, ThumbsDown, Copy, Check, RefreshCw } from 'lucide-react';
import { cn } from '@/libs/utils';
import type { ChatMessage, FeedbackValue } from '@/routes/chat/types';
import { extractUrls } from '@/routes/chat/_utils/extract-urls';
import { SourcesModal } from '@/routes/chat/_components/sources-modal';

function StreamingText({ content }: { content: string }) {
  const prevRef = useRef('');
  const oldContent = prevRef.current;
  const newContent = content.slice(oldContent.length);

  useEffect(() => {
    prevRef.current = content;
  });

  return (
    <span className="whitespace-pre-wrap">
      {oldContent}
      {newContent && (
        <motion.span
          key={content.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.12 }}
        >
          {newContent}
        </motion.span>
      )}
    </span>
  );
}

interface ChatBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
  onRegenerate?: (id: string) => void;
  onFeedback?: (id: string, value: FeedbackValue) => void;
  onRemoveFeedback?: (id: string) => void;
}

function ActionBar({
  message,
  onRegenerate,
  onFeedback,
  onRemoveFeedback,
}: {
  message: ChatMessage;
  onRegenerate?: (id: string) => void;
  onFeedback?: (id: string, value: FeedbackValue) => void;
  onRemoveFeedback?: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleFeedback(value: FeedbackValue) {
    if (message.feedback === value) {
      onRemoveFeedback?.(message.id);
    } else {
      onFeedback?.(message.id, value);
    }
  }

  return (
    <div className="flex items-center gap-0.5 mt-1.5 flex-wrap">
      <SourcesModal urls={extractUrls(message.content)} />
      <button
        onClick={handleCopy}
        title="Copy"
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      <button
        onClick={() => handleFeedback('up')}
        title="Good response"
        className={cn(
          'p-1.5 rounded-md transition-colors',
          message.feedback === 'up'
            ? 'text-green-500 bg-green-500/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        )}
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => handleFeedback('down')}
        title="Bad response"
        className={cn(
          'p-1.5 rounded-md transition-colors',
          message.feedback === 'down'
            ? 'text-red-500 bg-red-500/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        )}
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onRegenerate?.(message.id)}
        title="Regenerate"
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function StreamingBubble() {
  const content = useChatStore((state) => state.streamingContent ?? '');

  return (
    <div className="flex w-full gap-3 justify-start">
      <img
        src="/logo.png"
        alt="AI"
        className="w-7 h-7 rounded-full mt-1 shrink-0"
      />
      <div className="flex flex-col items-start max-w-[90%]">
        <div className="text-base leading-relaxed bg-transparent text-foreground py-1 [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
          <StreamingText content={content} />
          <span className="inline-block w-0.5 h-4 bg-current opacity-70 animate-pulse ml-0.5 align-middle" />
        </div>
      </div>
    </div>
  );
}

export const ChatBubble = memo(function ChatBubble({ message, isStreaming = false, onRegenerate, onFeedback, onRemoveFeedback }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const isProcessing = !isUser && message.status === 'processing';
  const isEmpty = !isUser && !isProcessing && message.content === '';

  if (isEmpty) return null;

  return (
    <div className={cn('flex w-full gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <img
          src="/logo.png"
          alt="AI"
          className="w-7 h-7 rounded-full mt-1 shrink-0"
        />
      )}
      <div className={cn('flex flex-col', isUser ? 'items-end max-w-[80%]' : 'items-start max-w-[90%]')}>
        <div
          className={cn(
            'text-base leading-relaxed',
            isUser
              ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-xs px-4 py-2.5 shadow-xs font-medium'
              : 'bg-transparent text-foreground py-1',

            '[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
            '[&_a]:underline [&_a]:text-chart-5 [&_a]:font-medium hover:[&_a]:opacity-80',
            '[&_code]:rounded [&_code]:bg-muted [&_code]:text-foreground [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm',
          )}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2 text-muted-foreground text-sm">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
              </span>
              Processing in background…
            </span>
          ) : isStreaming ? (
            <>
              <StreamingText content={message.content} />
              <span className="inline-block w-0.5 h-4 bg-current opacity-70 animate-pulse ml-0.5 align-middle" />
            </>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          )}
        </div>

        {!isUser && !isProcessing && !isStreaming && (
          <ActionBar
            message={message}
            onRegenerate={onRegenerate}
            onFeedback={onFeedback}
            onRemoveFeedback={onRemoveFeedback}
          />
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-primary/10 mt-1 shrink-0 flex items-center justify-center text-xs font-bold text-primary">
          U
        </div>
      )}
    </div>
  );
});
