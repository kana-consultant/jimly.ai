import type { ChatRepository } from '#/domain/chat/chat-repository';
import type { AiGateway } from '#/domain/ports/ai-gateway';
import type { AuthedContext } from '../shared/context';
import { badGateway } from '../shared/errors';

// ponytail: provisional — mirrors the current /api/chat behavior (no persistence).
// Phase 3 replaces this with send-message: persist user → stream → persist assistant.
export const makeSendChat =
  (repo: ChatRepository, gateway: AiGateway) =>
  async (input: { chatId: string; content: string }, ctx: AuthedContext): Promise<ReadableStream<Uint8Array>> => {
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

    try {
      return await gateway.streamReply(assistantId, ctx.origin);
    } catch {
      throw badGateway('Failed to stream reply');
    }
  };
