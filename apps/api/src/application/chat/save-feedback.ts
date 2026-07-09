import type { ChatRepository } from '#/domain/chat/chat-repository';
import type { FeedbackValue } from '#/domain/chat/chat';
import type { AuthedContext } from '../shared/context';

export interface SaveFeedbackInput {
  messageId: string;
  value: FeedbackValue;
}

export const makeSaveFeedback =
  (repo: ChatRepository) =>
  async (input: SaveFeedbackInput, ctx: AuthedContext): Promise<void> => {
    await repo.upsertFeedback({
      id: crypto.randomUUID(),
      messageId: input.messageId,
      userId: ctx.userId,
      value: input.value,
      createdAt: new Date().toISOString(),
    });
  };

export interface DeleteFeedbackInput {
  messageId: string;
}

export const makeDeleteFeedback =
  (repo: ChatRepository) =>
  async (input: DeleteFeedbackInput, ctx: AuthedContext): Promise<void> => {
    await repo.deleteFeedback(input.messageId, ctx.userId);
  };
