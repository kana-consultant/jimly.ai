import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex w-full mb-2', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] text-base leading-relaxed transition-all duration-200',
          isUser 
            ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-xs px-4 py-2.5 shadow-xs font-medium' 
            : 'bg-transparent text-foreground px-0 py-2 shadow-none max-w-[90%]',
          
          '[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
          '[&_a]:underline [&_a]:text-secondary [&_a]:font-medium hover:[&_a]:opacity-80',  
          '[&_code]:rounded [&_code]:bg-muted [&_code]:text-foreground [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm'
        )}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}