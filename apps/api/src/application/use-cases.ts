import type { ChatRepository } from '#/domain/chat/chat-repository';
import type { AiGateway } from '#/domain/ports/ai-gateway';
import type { RateLimiter } from '#/domain/ports/rate-limiter';
import { makeListSessions } from './chat/list-sessions';
import { makeCreateSession } from './chat/create-session';
import { makeUpdateSession } from './chat/update-session';
import { makeDeleteSession } from './chat/delete-session';
import { makeListMessages } from './chat/list-messages';
import { makeAddMessage } from './chat/add-message';
import { makeSendChat } from './chat/send-chat';

// Deps are already request-scoped (repo bound to userId) by the composition root.
export interface UseCaseDeps {
  repo: ChatRepository;
  gateway: AiGateway;
  rateLimiter: RateLimiter;
}

export function buildUseCases({ repo, gateway, rateLimiter }: UseCaseDeps) {
  return {
    listSessions: makeListSessions(repo),
    createSession: makeCreateSession(repo),
    updateSession: makeUpdateSession(repo),
    deleteSession: makeDeleteSession(repo),
    listMessages: makeListMessages(repo),
    addMessage: makeAddMessage(repo),
    sendChat: makeSendChat(repo, gateway),
    checkRateLimit: (key: string) => rateLimiter.check(key),
  };
}

export type UseCases = ReturnType<typeof buildUseCases>;
