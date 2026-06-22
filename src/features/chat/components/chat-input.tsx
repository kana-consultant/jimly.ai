import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSendMessage } from '@/features/chat/logic/use-send-message';

export function ChatInput() {
  const [value, setValue] = useState('');
  const { isStreaming, error, sendMessage, retry } = useSendMessage();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = value.trim();
    if (!content || isStreaming) return;
    setValue('');
    await sendMessage(content);
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6 pt-2 bg-background">
      {/* Banner Error yang Lebih Rapih */}
      {error && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive border border-destructive/20 animate-in fade-in-50">
          <span className="font-medium">{error}</span>
          <Button type="button" variant="ghost" size="sm" className="h-8 hover:bg-destructive/20 text-destructive font-semibold" onClick={retry}>
            Retry
          </Button>
        </div>
      )}

      {/* Form Kapsul ala Modern AI */}
      <form 
        onSubmit={handleSubmit} 
        className="relative flex items-center gap-2 rounded-full bg-muted/70 border border-input px-4 py-1.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring focus-within:bg-background"
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tanya jimly.ai..."
          disabled={isStreaming}
          className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-1 py-3 h-auto text-base placeholder:text-muted-foreground/70"
        />
        
        <Button 
          type="submit" 
          size="icon"
          disabled={isStreaming || !value.trim()}
          className="rounded-full h-9 w-9 shrink-0 transition-all duration-200"
        >
          {/* SVG Ikon Panah Kirim Modern */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-4 h-4"
          >
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.53 60.53 0 0 0 18.425-8.806.75.75 0 0 0 0-1.18 60.53 60.53 0 0 0-18.425-8.807Z" />
          </svg>
          <span className="sr-only">Send</span>
        </Button>
      </form>
      <p className="text-[11px] text-center text-muted-foreground/60 mt-2">
        jimly.ai dapat menampilkan informasi yang kurang akurat, pastikan untuk memeriksa kembali.
      </p>
    </div>
  );
}