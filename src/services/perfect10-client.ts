const API_URL = import.meta.env.PERFECT10_API_URL;
const API_KEY = import.meta.env.PERFECT10_API_KEY;
const AGENT_ID = Number(import.meta.env.PERFECT10_AGENT_ID);

function perfect10Fetch(path: string, origin: string, init?: RequestInit) {
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      'X-Actual-Origin': origin,
      ...init?.headers,
    },
  });
}

export async function createPerfect10Session(origin: string): Promise<string> {
  const res = await perfect10Fetch('/integrate/v1/chat/sessions', origin, {
    method: 'POST',
    body: JSON.stringify({ agent_id: AGENT_ID }),
  });
  if (!res.ok) throw new Error(`Failed to create chat session: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { session_id: string };
  return data.session_id;
}

export async function sendPerfect10Message(
  perfect10SessionId: string,
  content: string,
  origin: string
): Promise<number> {
  const res = await perfect10Fetch(`/integrate/v1/chat/sessions/${perfect10SessionId}/messages`, origin, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(`Failed to send message: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { assistant_message_id: number };
  return data.assistant_message_id;
}

export async function streamPerfect10Reply(
  assistantMessageId: number,
  origin: string
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${API_URL}/integrate/v1/chat/stream/${assistantMessageId}`, {
    headers: { Accept: 'text/event-stream', 'X-API-Key': API_KEY, 'X-Actual-Origin': origin },
  });
  if (!res.ok || !res.body) throw new Error(`Failed to stream reply: ${res.status} ${await res.text()}`);
  return res.body.pipeThrough(translateStream());
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
            const chunk = JSON.stringify({ choices: [{ delta: { content: parsed.text } }] });
            controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
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
