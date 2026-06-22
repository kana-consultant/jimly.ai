import { Send, FileText } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

type DemoMessage = {
  type: "user" | "bot"
  text: string
  source?: string
}

const MESSAGES: DemoMessage[] = [
  { type: "user", text: "What is the authority of the Constitutional Court under Indonesian law?" },
  {
    type: "bot",
    text: "The Mahkamah Konstitusi holds five primary authorities under the 1945 Constitution: (1) judicial review of legislation, (2) resolving disputes between state institutions, (3) dissolution of political parties, (4) disputes over election results, and (5) presidential impeachment proceedings.",
    source: "The Constitutional Law of Indonesia  Ch. 4: Judicial Power",
  },
  { type: "user", text: "What does Prof. Jimly say about constitutional ethics?" },
  {
    type: "bot",
    text: "Constitutional ethics operates alongside legal norms  it is the moral framework guiding the conduct of constitutional institutions. A court may act lawfully yet violate constitutional ethics if it undermines public trust or institutional integrity.",
    source: "Peradilan Etik dan Etika Konstitusi  Ch. 2",
  },
]

function ChatBubble({ message, visible }: { message: DemoMessage; visible: boolean }) {
  const isUser = message.type === "user"
  return (
    <div
      className={cn(
        "flex items-start gap-3 opacity-0 transition-opacity duration-400",
        isUser && "flex-row-reverse",
        visible && "opacity-100"
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-card font-display text-[15px] font-bold text-secondary"
        )}
      >
        {isUser ? "U" : "J"}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3 text-[13.5px] leading-relaxed",
          isUser
            ? "rounded-tr-md bg-primary text-primary-foreground"
            : "rounded-tl-md border border-border bg-card text-foreground"
        )}
      >
        {message.text}
        {message.source && (
          <div className="mt-2.5 flex items-center gap-1.5 border-t border-border pt-2 text-[11.5px] font-medium text-secondary">
            <FileText className="size-3 shrink-0" />
            {message.source}
          </div>
        )}
      </div>
    </div>
  )
}

function TypingBubble() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card font-display text-[15px] font-bold text-secondary">
        J
      </div>
      <div className="rounded-lg rounded-tl-md border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-1 py-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.25 animate-pulse rounded-full bg-muted-foreground"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function ChatDemo() {
  const [shown, setShown] = useState<DemoMessage[]>([])
  const [typing, setTyping] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let idx = 0
    let cancelled = false
    const timeouts: ReturnType<typeof setTimeout>[] = []

    function schedule(fn: () => void, delay: number) {
      const id = setTimeout(() => {
        if (!cancelled) fn()
      }, delay)
      timeouts.push(id)
    }

    function play() {
      if (idx >= MESSAGES.length) {
        schedule(() => {
          setShown([])
          idx = 0
          play()
        }, 4000)
        return
      }
      const message = MESSAGES[idx]
      if (message.type === "user") {
        schedule(
          () => {
            setShown((prev) => [...prev, message])
            idx++
            play()
          },
          idx === 0 ? 900 : 2600
        )
      } else {
        setTyping(true)
        schedule(() => {
          setTyping(false)
          setShown((prev) => [...prev, message])
          idx++
          play()
        }, 1800)
      }
    }
    play()

    return () => {
      cancelled = true
      timeouts.forEach(clearTimeout)
    }
  }, [])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [shown, typing])

  return (
    <div className="mx-auto max-w-190 overflow-hidden rounded-xl border border-border bg-card shadow-[0_8px_32px_rgba(16,42,67,0.12),0_4px_12px_rgba(16,42,67,0.06)]">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
        <div className="font-display text-[17px] font-semibold text-primary">
          jimly<span className="text-secondary">.ai</span>
        </div>
        <div className="rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-success">
          ● Online
        </div>
        <div className="ml-auto text-xs text-muted-foreground-faint">Referencing 60+ books</div>
      </div>
      <div ref={bodyRef} className="flex min-h-65 flex-col gap-5 bg-background p-6">
        {shown.map((message, i) => (
          <ChatBubble key={i} message={message} visible />
        ))}
        {typing && <TypingBubble />}
      </div>
      <div className="flex items-center gap-2.5 border-t border-border bg-card px-4 py-3">
        <input
          className="flex-1 rounded-md border border-border bg-background px-3.5 py-2 text-[13px] text-foreground outline-none focus:border-primary focus:ring-3 focus:ring-primary/5"
          type="text"
          placeholder="Ask about Indonesian constitutional law…"
          readOnly
        />
        <button
          type="button"
          className="flex size-8.5 shrink-0 items-center justify-center rounded-md bg-primary transition-colors hover:bg-primary-hover"
          aria-label="Send"
        >
          <Send className="size-3.5 text-primary-foreground" />
        </button>
      </div>
    </div>
  )
}
