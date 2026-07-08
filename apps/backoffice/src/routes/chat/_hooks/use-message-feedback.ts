import { useCallback } from 'react';
import { chatStoreActions } from '@/routes/chat/_hooks/chat-store';
import type { FeedbackValue } from '@/routes/chat/types';

const send = (url: string, method: string) =>
  fetch(url, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' } });

const sendJson = (url: string, method: string, body: unknown) =>
  fetch(url, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export function useMessageFeedback(sessionId: string) {
  const submitFeedback = useCallback(async (messageId: string, value: FeedbackValue) => {
    chatStoreActions.setMessageFeedback(sessionId, messageId, value);
    try {
      await sendJson(`/api/sessions/${sessionId}/messages/${messageId}/feedback`, 'POST', { value });
    } catch {
      chatStoreActions.setMessageFeedback(sessionId, messageId, null);
    }
  }, [sessionId]);

  const removeFeedback = useCallback(async (messageId: string) => {
    chatStoreActions.setMessageFeedback(sessionId, messageId, null);
    try {
      await send(`/api/sessions/${sessionId}/messages/${messageId}/feedback`, 'DELETE');
    } catch {
      // best-effort, don't roll back UI for DELETE failures
    }
  }, [sessionId]);

  return { submitFeedback, removeFeedback };
}
