interface OutgoingMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function* streamChatCompletion(messages: OutgoingMessage[]): AsyncGenerator<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
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

function parseDeltaContent(data: string): string | null {
  try {
    const parsed = JSON.parse(data);
    return parsed.choices?.[0]?.delta?.content ?? null;
  } catch {
    return null;
  }
}
