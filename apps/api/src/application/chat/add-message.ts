import type { ChatRepository } from '#/domain/chat/chat-repository';
import type { ChatMessage } from '#/domain/chat/chat';
import { forbidden } from '../shared/errors';

// Presentation (api/_lib/validate.ts) already restricts this to role 'user' —
// assistant replies are persisted server-side by send-message.ts instead.
export const makeAddMessage = (repo: ChatRepository) => async (input: ChatMessage) => {
  try {
    await repo.addMessage(input);
  } catch {
    throw forbidden('Cannot post to this session');
  }
};
