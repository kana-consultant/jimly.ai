import { createPerfect10Session, sendPerfect10Message, streamPerfect10Reply } from '../src/services/perfect10-client';
import { withUser } from './_lib/with-user';
import { checkRateLimit } from './_lib/rate-limit';

interface Body {
  chatId: string;
  messages: { role: string; content: string }[];
}

export default withUser(async ({ req, userId, repo }) => {
  const limited = await checkRateLimit(userId);
  if (limited) return limited;
  const origin = new URL(req.url).origin;
  const { chatId, messages } = (await req.json()) as Body;
  const last = messages[messages.length - 1];
  if (!last) return Response.json({ error: 'No message to send' }, { status: 400 });

  let pid = await repo.getPerfect10SessionId(chatId);
  if (!pid) {
    try {
      pid = await createPerfect10Session(origin);
    } catch {
      return Response.json({ error: 'Failed to create chat session' }, { status: 502 });
    }
    await repo.setPerfect10SessionId(chatId, pid);
  }

  let assistantId: number;
  try {
    assistantId = await sendPerfect10Message(pid, last.content, origin);
  } catch {
    return Response.json({ error: 'Failed to send message' }, { status: 502 });
  }

  let stream: ReadableStream<Uint8Array>;
  try {
    stream = await streamPerfect10Reply(assistantId, origin);
  } catch {
    return Response.json({ error: 'Failed to stream reply' }, { status: 502 });
  }

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
});
