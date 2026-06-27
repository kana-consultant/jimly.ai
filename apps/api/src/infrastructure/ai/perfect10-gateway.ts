import { env } from '#/infrastructure/config/env';
import type { AiGateway } from '#/domain/ports/ai-gateway';

export function createPerfect10Gateway(): AiGateway {
  const apiFetch = (path: string, origin: string, init?: RequestInit) =>
    fetch(`${env.PERFECT10_API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': env.PERFECT10_API_KEY,
        'X-Actual-Origin': origin,
        ...init?.headers,
      },
    });

  return {
    async createSession(origin) {
      const res = await apiFetch('/integrate/v1/chat/sessions', origin, {
        method: 'POST',
        body: JSON.stringify({ agent_id: env.PERFECT10_AGENT_ID }),
      });
      if (!res.ok) throw new Error('Failed to create chat session');
      const data = (await res.json()) as { session_id: string };
      return data.session_id;
    },

    async sendMessage(perfect10SessionId, content, origin) {
      const res = await apiFetch(`/integrate/v1/chat/sessions/${perfect10SessionId}/messages`, origin, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      const data = (await res.json()) as { assistant_message_id: number };
      return data.assistant_message_id;
    },

    async streamReply(assistantMessageId, origin) {
      const res = await fetch(`${env.PERFECT10_API_URL}/integrate/v1/chat/stream/${assistantMessageId}`, {
        headers: { Accept: 'text/event-stream', 'X-API-Key': env.PERFECT10_API_KEY, 'X-Actual-Origin': origin },
      });
      if (!res.ok || !res.body) throw new Error('Failed to stream reply');
      return res.body.pipeThrough(translateStream());
    },
  };
}

function translateStream(): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (!data) continue;

        try {
          const parsed = JSON.parse(data) as { text?: string };
          if (parsed.text) {
            const out = JSON.stringify({ choices: [{ delta: { content: parsed.text } }] });
            controller.enqueue(encoder.encode(`data: ${out}\n\n`));
          }
        } catch {
          // ignore malformed upstream lines
        }
      }
    },
    flush(controller) {
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    },
  });
}
