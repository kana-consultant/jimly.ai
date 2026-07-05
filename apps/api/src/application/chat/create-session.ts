import type { ChatRepository } from '#/domain/chat/chat-repository';
import type { NewChatSession } from '#/domain/chat/chat';

export const makeCreateSession = (repo: ChatRepository) => (input: NewChatSession) =>
  repo.createSession(input);
