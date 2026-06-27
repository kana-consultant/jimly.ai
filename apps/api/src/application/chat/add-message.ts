import type { ChatRepository } from '#/domain/chat/chat-repository';
import type { ChatMessage } from '#/domain/chat/chat';

// Phase 2: client-posted message persistence (unchanged behavior).
// Phase 3 rejects non-`user` roles and moves assistant writes server-side.
export const makeAddMessage = (repo: ChatRepository) => (input: ChatMessage) =>
  repo.addMessage(input);
