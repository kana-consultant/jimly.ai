import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSessionUserId } from '@/services/session-manager';

interface ChatRequestBody {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient(cookies);
  const userId = await getSessionUserId(supabase);
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { messages } = (await request.json()) as ChatRequestBody;

  const upstream = await fetch(`${import.meta.env.PERFECT10_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.PERFECT10_API_KEY}`,
    },
    body: JSON.stringify({ messages, stream: true }),
  });

  if (!upstream.ok || !upstream.body) {
    return Response.json({ error: 'Upstream chat request failed' }, { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};
