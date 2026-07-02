import type { ChatRepository } from '#/domain/chat/chat-repository';

export const makeListMessages = (repo: ChatRepository) => (sessionId: string) =>
  repo.listMessages(sessionId);
