import { env } from '#/infrastructure/config/env';
import type { AiGateway } from '#/domain/ports/ai-gateway';
import { sseDataLine, sseDoneLine, splitSseLines } from './sse-codec';

const _encoder = new TextEncoder();

// ponytail: wall-clock timeout removed — inactivity timeout resets per chunk.
// Raise INACTIVITY_TIMEOUT_MS (or move to env) if upstream legitimately pauses >30s.
const REQUEST_TIMEOUT_MS = 15_000;
const LLM_TIMEOUT_MS = 60_000;
const INACTIVITY_TIMEOUT_MS = 30_000;

export function makeInactivitySignal(ms: number) {
  const controller = new AbortController();
  let timer = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    reset() { clearTimeout(timer); timer = setTimeout(() => controller.abort(), ms); },
    clear() { clearTimeout(timer); },
  };
}

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
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error('Failed to create chat session');
      const data = (await res.json()) as { session_id: string };
      return data.session_id;
    },

    async sendMessage(perfect10SessionId, content, origin) {
      const res = await apiFetch(`/integrate/v1/chat/sessions/${perfect10SessionId}/messages`, origin, {
        method: 'POST',
        body: JSON.stringify({ content }),
        signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error('Failed to send message');
      const data = (await res.json()) as { assistant_message_id: number };
      return data.assistant_message_id;
    },

    async streamReply(assistantMessageId, origin) {
      const inactivity = makeInactivitySignal(INACTIVITY_TIMEOUT_MS);
      const res = await apiFetch(`/integrate/v1/chat/stream/${assistantMessageId}`, origin, {
        headers: { Accept: 'text/event-stream' },
        signal: inactivity.signal,
      });
      if (!res.ok || !res.body) {
        inactivity.clear();
        throw new Error('Failed to stream reply');
      }
      return res.body.pipeThrough(translateStream(inactivity));
    },
  };
}

function translateStream(
  inactivity: ReturnType<typeof makeInactivitySignal>,
): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  let buffer = '';

  return new TransformStream({
    transform(chunk, controller) {
      inactivity.reset();
      const { lines, remainder } = splitSseLines(buffer, decoder.decode(chunk, { stream: true }));
      buffer = remainder;

      let hadContent = false;
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (!data) continue;
        try {
          const parsed = JSON.parse(data) as { text?: string };
          if (parsed.text) {
            controller.enqueue(
              sseDataLine(JSON.stringify({ choices: [{ delta: { content: parsed.text } }] })),
            );
            hadContent = true;
          }
        } catch {
          // ignore malformed upstream lines
        }
      }

      // Emit SSE comment keepalive when upstream sends non-text events (e.g. status/thinking).
      // Prevents proxy idle-timeout from closing the client connection before content arrives.
      if (!hadContent) {
        controller.enqueue(_encoder.encode(': ping\n\n'));
      }
    },
    flush(controller) {
      inactivity.clear();
      controller.enqueue(sseDoneLine());
    },
  });
}
