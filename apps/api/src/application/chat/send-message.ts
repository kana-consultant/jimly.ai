import type { ChatRepository } from '#/domain/chat/chat-repository';
import type { AiGateway } from '#/domain/ports/ai-gateway';
import type { AuthedContext } from '../shared/context';
import { badGateway } from '../shared/errors';
import { parseDeltaContent, splitSseLines } from '#/infrastructure/ai/sse-codec';

export interface SendMessageInput {
  chatId: string;
  content: string;
}

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
        const { lines, remainder } = splitSseLines(buffer, decoder.decode(chunk, { stream: true }));
        buffer = remainder;
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (!data || data === '[DONE]') continue;
          const delta = parseDeltaContent(data);
          if (delta) fullText += delta;
        }
      },
      async flush() {
        if (fullText) await onComplete(fullText);
      },
    }),
  );
}

export const makeSendMessage =
  (repo: ChatRepository, gateway: AiGateway) =>
  async (input: SendMessageInput, ctx: AuthedContext): Promise<ReadableStream<Uint8Array>> => {
    const getOrCreateSession = async () => {
      let pid = await repo.getPerfect10SessionId(input.chatId);
      if (!pid) {
        try {
          pid = await gateway.createSession(ctx.origin);
        } catch {
          throw badGateway('Failed to create chat session');
        }
        await repo.setPerfect10SessionId(input.chatId, pid);
      }
      return pid;
    };

    const [pid] = await Promise.all([
      getOrCreateSession(),
      repo.addMessage({
        id: crypto.randomUUID(),
        sessionId: input.chatId,
        role: 'user',
        content: input.content,
        createdAt: new Date().toISOString(),
      }),
    ]);

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
