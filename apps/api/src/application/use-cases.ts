import type { ChatRepository } from '#/domain/chat/chat-repository';
import type { AiGateway } from '#/domain/ports/ai-gateway';
import { makeListSessions } from './chat/list-sessions';
import { makeCreateSession } from './chat/create-session';
import { makeUpdateSession } from './chat/update-session';
import { makeDeleteSession } from './chat/delete-session';
import { makeListMessages } from './chat/list-messages';
import { makeAddMessage } from './chat/add-message';
import { makeSendMessage } from './chat/send-message';

// Deps are already request-scoped (repo bound to userId) by the composition root.
// Rate limiting happens in api/_lib/with-user.ts, before use-cases are built.
export interface UseCaseDeps {
  repo: ChatRepository;
  gateway: AiGateway;
}

export function buildUseCases({ repo, gateway }: UseCaseDeps) {
  return {
    listSessions: makeListSessions(repo),
    createSession: makeCreateSession(repo),
    updateSession: makeUpdateSession(repo),
    deleteSession: makeDeleteSession(repo),
    listMessages: makeListMessages(repo),
    addMessage: makeAddMessage(repo),
    sendMessage: makeSendMessage(repo, gateway),
  };
}

export type UseCases = ReturnType<typeof buildUseCases>;
