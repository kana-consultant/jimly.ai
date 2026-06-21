import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSessionUserId } from '@/services/session-manager';
import { createSupabaseChatRepository } from '@/services/supabase-chat-repository';

interface ChatRequestBody {
  chatId: string;
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
}

const API_URL = import.meta.env.PERFECT10_API_URL;
const API_KEY = import.meta.env.PERFECT10_API_KEY;
const AGENT_ID = Number(import.meta.env.PERFECT10_AGENT_ID);

async function perfect10Fetch(path: string, init?: RequestInit) {
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY, ...init?.headers },
  });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient(cookies, request);
  const userId = await getSessionUserId(supabase);
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { chatId, messages } = (await request.json()) as ChatRequestBody;
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) return Response.json({ error: 'No message to send' }, { status: 400 });

  const chatRepository = createSupabaseChatRepository(supabase);
  let perfect10SessionId = await chatRepository.getPerfect10SessionId(chatId);

  if (!perfect10SessionId) {
    const sessionRes = await perfect10Fetch('/integrate/v1/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ agent_id: AGENT_ID }),
    });
    if (!sessionRes.ok) return Response.json({ error: 'Failed to create chat session' }, { status: 502 });
    const sessionData = (await sessionRes.json()) as { session_id: string };
    perfect10SessionId = sessionData.session_id;
    await chatRepository.setPerfect10SessionId(chatId, perfect10SessionId);
  }

  const messageRes = await perfect10Fetch(`/integrate/v1/chat/sessions/${perfect10SessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content: lastMessage.content }),
  });
  if (!messageRes.ok) return Response.json({ error: 'Failed to send message' }, { status: 502 });
  const messageData = (await messageRes.json()) as { assistant_message_id: number };

  const streamRes = await fetch(`${API_URL}/integrate/v1/chat/stream/${messageData.assistant_message_id}`, {
    headers: { Accept: 'text/event-stream', 'X-API-Key': API_KEY },
  });
  if (!streamRes.ok || !streamRes.body) return Response.json({ error: 'Failed to stream reply' }, { status: 502 });

  const translated = translateStream(streamRes.body);

  return new Response(translated, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};

function translateStream(upstream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const reader = upstream.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
        return;
      }

      buffer += decoder.decode(value, { stream: true });
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
  });
}
