import { useRef, useEffect } from 'react';

const NEAR_BOTTOM_PX = 150;

export function useScrollToBottom(isStreaming: boolean, messageCount: number, hasMessages: boolean) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;

    if (!hasMessages) {
      prevCountRef.current = messageCount;
      return;
    }

    if (!el) return;

    const isNewMessage = messageCount > prevCountRef.current;
    prevCountRef.current = messageCount;

    if (isNewMessage) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'auto' });
      return;
    }

    if (isStreaming) {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (distanceFromBottom <= NEAR_BOTTOM_PX) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'auto' });
      }
    }
  });

  return scrollRef;
}
