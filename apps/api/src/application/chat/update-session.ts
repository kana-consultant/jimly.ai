import type { ChatRepository } from '#/domain/chat/chat-repository';

type Patch = { updatedAt?: string; pinned?: boolean; title?: string };

export const makeUpdateSession =
  (repo: ChatRepository) => (input: { id: string; patch: Patch }) =>
    repo.updateSession(input.id, input.patch);
