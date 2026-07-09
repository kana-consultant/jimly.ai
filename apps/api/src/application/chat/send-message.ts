import type { ChatRepository } from '#/domain/chat/chat-repository';
import type { AiGateway } from '#/domain/ports/ai-gateway';
import type { AuthedContext } from '../shared/context';
import { badGateway } from '../shared/errors';
import { parseDeltaContent, splitSseLines } from '#/infrastructure/ai/sse-codec';

export interface SendMessageInput {
  chatId: string;
  content: string;
}

export interface SendMessageResult {
  stream: ReadableStream<Uint8Array>;
  backgroundSave: Promise<void>;
}

async function callGateway<T>(fn: () => Promise<T>, msg: string): Promise<T> {
  try {
    return await fn();
  } catch {
    throw badGateway(msg);
  }
}

async function resolveOrCreatePerfect10Session(
  repo: ChatRepository,
  gateway: AiGateway,
  chatId: string,
  origin: string,
): Promise<string> {
  const existing = await repo.getPerfect10SessionId(chatId);
  if (existing) return existing;
  const pid = await callGateway(() => gateway.createSession(origin), 'Failed to create chat session');
  await repo.setPerfect10SessionId(chatId, pid);
  return pid;
}

async function consumeStreamAndSave(
  stream: ReadableStream<Uint8Array>,
  onComplete: (fullText: string) => Promise<void>,
  onError: () => Promise<void>,
): Promise<void> {
  const decoder = new TextDecoder();
  const reader = stream.getReader();
  let buffer = '';
  let fullText = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const { lines, remainder } = splitSseLines(buffer, decoder.decode(value, { stream: true }));
      buffer = remainder;
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (!data || data === '[DONE]') continue;
        const delta = parseDeltaContent(data);
        if (delta) fullText += delta;
      }
    }
    if (fullText) await onComplete(fullText);
  } catch {
    await onError().catch(() => {});
  } finally {
    reader.releaseLock();
  }
}

export const makeSendMessage =
  (repo: ChatRepository, gateway: AiGateway) =>
  async (input: SendMessageInput, ctx: AuthedContext): Promise<SendMessageResult> => {
    const [pid] = await Promise.all([
      resolveOrCreatePerfect10Session(repo, gateway, input.chatId, ctx.origin),
      repo.addMessage({
        id: crypto.randomUUID(),
        sessionId: input.chatId,
        role: 'user',
        content: input.content,
        status: 'completed',
        createdAt: new Date().toISOString(),
      }),
    ]);

    const assistantId = await callGateway(
      () => gateway.sendMessage(pid, input.content, ctx.origin),
      'Failed to send message',
    );

    const upstream = await callGateway(
      () => gateway.streamReply(assistantId, ctx.origin),
      'Failed to stream reply',
    );

    const assistantMessageId = crypto.randomUUID();
    const now = new Date().toISOString();

    const [clientStream, saveStream] = upstream.tee();

    // Don't await — chains into backgroundSave so the update only runs after insert.
    // Saves ~30-50ms TTFB on every request; safe because streaming takes seconds.
    const backgroundSave = repo
      .addMessage({
        id: assistantMessageId,
        sessionId: input.chatId,
        role: 'assistant',
        content: '',
        status: 'processing',
        createdAt: now,
      })
      .then(() =>
        consumeStreamAndSave(
          saveStream,
          (fullText) => repo.updateMessage(assistantMessageId, { content: fullText, status: 'completed' }),
          () => repo.updateMessage(assistantMessageId, { status: 'failed' }),
        ),
      );

    return { stream: clientStream, backgroundSave };
  };
