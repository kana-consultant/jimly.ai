import { parseDeltaContent } from './sse-codec';

export async function* streamChatCompletion(
  chatId: string,
  content: string,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, content }),
    signal,
  });

  if (!res.ok || !res.body) throw new Error('Chat stream request failed');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') return;
      const delta = parseDeltaContent(data);
      if (delta) yield delta;
    }
  }
}
