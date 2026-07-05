import type { ChatRole } from '@jimly/api';

// Shared DTOs come from the API package (type-only). View-only types stay here.
export type { ChatSession, ChatMessage, ChatRole, NewChatSession } from '@jimly/api';

export interface OutgoingMessage {
  role: ChatRole;
  content: string;
}
