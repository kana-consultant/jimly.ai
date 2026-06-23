import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const isEmpty = !isUser && message.content === '';

  if (isEmpty) return null;

  return (
    <div className={cn('flex w-full gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <img
          src="/jimly.ai-logo.png"
          alt="AI"
          className="w-7 h-7 rounded-full mt-1 shrink-0"
        />
      )}
      <div
        className={cn(
          'text-base leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-xs px-4 py-2.5 shadow-xs font-medium max-w-[80%]'
            : 'bg-transparent text-foreground py-1 max-w-[90%]',

          '[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
          '[&_a]:underline [&_a]:text-secondary [&_a]:font-medium hover:[&_a]:opacity-80',
          '[&_code]:rounded [&_code]:bg-muted [&_code]:text-foreground [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm',
        )}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-primary/10 mt-1 shrink-0 flex items-center justify-center text-xs font-bold text-primary">
          U
        </div>
      )}
    </div>
  );
}