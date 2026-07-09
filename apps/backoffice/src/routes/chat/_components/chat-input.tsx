import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import { type ReactNode, useRef } from 'react';
import { Send, Square, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/libs/utils';
import { useSendMessage } from '@/routes/chat/_hooks/use-send-message';
import { useChatStore } from '@/routes/chat/_hooks/chat-store';
import { useChatError } from '@/routes/chat/_hooks/use-chat-stream';

interface ChatInputProps {
  showSuggestions?: boolean;
  onToggleSuggestions?: () => void;
  suggestions?: ReactNode;
}

const valueStore = new Store('');

export function ChatInput({ showSuggestions = false, onToggleSuggestions, suggestions }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const value = useStore(valueStore, (s) => s);
  const { sendMessage, retry } = useSendMessage();
  const isStreaming = useChatStore((s) => s.isStreaming);
  const error = useChatError();
  const hasMessages = useChatStore((s) => {
    const id = s.activeChatId;
    if (!id) return false;
    return (s.messagesByChatId[id]?.length ?? 0) > 0;
  });

  function resizeTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = value.trim();
    if (!content || isStreaming) return;
    valueStore.setState(() => '');
    resizeTextarea();
    await sendMessage(content);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className={cn('w-full', hasMessages && 'pb-2')}>
      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl bg-surface shadow-lg transition-shadow duration-200 focus-within:shadow-xl focus-within:ring-2 focus-within:ring-primary/20"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            valueStore.setState(() => e.target.value);
            resizeTextarea();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          disabled={isStreaming}
          rows={1}
          className="w-full resize-none border-0 bg-transparent px-4 pt-3 pb-1 text-base placeholder:text-muted-foreground/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="flex items-center justify-between px-3 pb-3">
          {onToggleSuggestions ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'rounded-xl gap-1.5 transition-all duration-200',
                      showSuggestions
                        ? 'text-primary bg-primary/10 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                    onClick={onToggleSuggestions}
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">Suggestion</span>
                  </Button>
                }
              />
              <TooltipContent>rekomendasi topik</TooltipContent>
            </Tooltip>
          ) : (
            <span />
          )}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="submit"
                  size="icon"
                  disabled={isStreaming || !value.trim()}
                  className="rounded-xl h-10 w-10 transition-all duration-200"
                >
                  {isStreaming ? (
                    <Square className="w-4 h-4 fill-current" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="sr-only">{isStreaming ? 'Stop' : 'Send'}</span>
                </Button>
              }
            />
            <TooltipContent>kirim</TooltipContent>
          </Tooltip>
        </div>
      </form>

      {suggestions}

      <p className="text-[11px] text-center text-muted-foreground/60 mt-2">
        jimly.ai can make mistakes. Please verify important information.
      </p>
    </div>
  );
}
