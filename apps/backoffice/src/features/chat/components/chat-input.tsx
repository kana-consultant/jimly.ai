import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import { type ReactNode } from 'react';
import { Send, Square, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useSendMessage } from '@/features/chat/logic/use-send-message';

interface ChatInputProps {
  showSuggestions?: boolean;
  onToggleSuggestions?: () => void;
  suggestions?: ReactNode;
}

const valueStore = new Store('');

let textareaEl: HTMLTextAreaElement | null = null;

function resizeTextarea() {
  if (!textareaEl) return;
  textareaEl.style.height = 'auto';
  textareaEl.style.height = Math.min(textareaEl.scrollHeight, 200) + 'px';
}

export function ChatInput({ showSuggestions = false, onToggleSuggestions, suggestions }: ChatInputProps) {
  const value = useStore(valueStore, (s) => s);
  const { activeChatId, messages, isStreaming, error, sendMessage, retry } = useSendMessage();

  const hasMessages = activeChatId !== null && messages.length > 0;

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
      {error && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive shadow-sm">
          <span className="font-medium">{error}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 hover:bg-destructive/20 text-destructive font-semibold"
            onClick={retry}
          >
            Retry
          </Button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl bg-surface shadow-lg transition-shadow duration-200 focus-within:shadow-xl focus-within:ring-2 focus-within:ring-primary/20"
      >
        <textarea
          ref={(el) => {
            textareaEl = el;
          }}
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
