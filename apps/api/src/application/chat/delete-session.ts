import type { ChatRepository } from '#/domain/chat/chat-repository';

export const makeDeleteSession = (repo: ChatRepository) => (id: string) =>
  repo.deleteSession(id);
