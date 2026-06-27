import type { ChatRepository } from '#/domain/chat/chat-repository';
import type { AiGateway } from '#/domain/ports/ai-gateway';
import type { AuthedContext } from '../shared/context';
import { badGateway } from '../shared/errors';

export interface SendMessageInput {
  chatId: string;
  content: string;
}

interface UpstreamDelta {
  choices?: { delta?: { content?: string } }[];
}

// Reads the gateway's SSE stream while passing every chunk through unchanged,
// and persists the assistant's full reply once the upstream stream ends —
// the client never gets to author an assistant message (security fix #1).
function persistReplyOnComplete(
  upstream: ReadableStream<Uint8Array>,
  onComplete: (fullText: string) => Promise<void>,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  return upstream.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        controller.enqueue(chunk);
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (!data || data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data) as UpstreamDelta;
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) fullText += delta;
          } catch {
            // ignore malformed upstream line
          }
        }
      },
      async flush() {
        if (fullText) await onComplete(fullText);
      },
    }),
  );
}

// Server-authored chat turn: persist the user's message, relay it upstream,
// then persist the assistant's reply once the stream completes.
export const makeSendMessage =
  (repo: ChatRepository, gateway: AiGateway) =>
  async (input: SendMessageInput, ctx: AuthedContext): Promise<ReadableStream<Uint8Array>> => {
    await repo.addMessage({
      id: crypto.randomUUID(),
      sessionId: input.chatId,
      role: 'user',
      content: input.content,
      createdAt: new Date().toISOString(),
    });

    let pid = await repo.getPerfect10SessionId(input.chatId);
    if (!pid) {
      try {
        pid = await gateway.createSession(ctx.origin);
      } catch {
        throw badGateway('Failed to create chat session');
      }
      await repo.setPerfect10SessionId(input.chatId, pid);
    }

    let assistantId: number;
    try {
      assistantId = await gateway.sendMessage(pid, input.content, ctx.origin);
    } catch {
      throw badGateway('Failed to send message');
    }

    let upstream: ReadableStream<Uint8Array>;
    try {
      upstream = await gateway.streamReply(assistantId, ctx.origin);
    } catch {
      throw badGateway('Failed to stream reply');
    }

    return persistReplyOnComplete(upstream, (fullText) =>
      repo.addMessage({
        id: crypto.randomUUID(),
        sessionId: input.chatId,
        role: 'assistant',
        content: fullText,
        createdAt: new Date().toISOString(),
      }),
    );
  };
