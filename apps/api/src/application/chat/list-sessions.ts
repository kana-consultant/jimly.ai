import type { ChatRepository } from '#/domain/chat/chat-repository';

// repo is already userId-scoped by the composition root.
export const makeListSessions = (repo: ChatRepository) => () => repo.listSessions();
