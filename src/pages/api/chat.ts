import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSessionUserId } from '@/services/session-manager';
import { createSupabaseChatRepository } from '@/services/supabase-chat-repository';
import { createPerfect10Session, sendPerfect10Message, streamPerfect10Reply } from '@/services/perfect10-client';

interface ChatRequestBody {
  chatId: string;
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient(cookies, request);
  const userId = await getSessionUserId(supabase);
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const origin = new URL(request.url).origin;
  const { chatId, messages } = (await request.json()) as ChatRequestBody;
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) return Response.json({ error: 'No message to send' }, { status: 400 });

  const chatRepository = createSupabaseChatRepository(supabase);
  let perfect10SessionId = await chatRepository.getPerfect10SessionId(chatId);

  if (!perfect10SessionId) {
    try {
      perfect10SessionId = await createPerfect10Session(origin);
    } catch (err) {
      console.error(err);
      return Response.json({ error: 'Failed to create chat session' }, { status: 502 });
    }
    await chatRepository.setPerfect10SessionId(chatId, perfect10SessionId);
  }

  let assistantMessageId: number;
  try {
    assistantMessageId = await sendPerfect10Message(perfect10SessionId, lastMessage.content, origin);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to send message' }, { status: 502 });
  }

  let translated: ReadableStream<Uint8Array>;
  try {
    translated = await streamPerfect10Reply(assistantMessageId, origin);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to stream reply' }, { status: 502 });
  }

  return new Response(translated, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};
