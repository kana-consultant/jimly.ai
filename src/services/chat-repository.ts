import type { ChatMessage, ChatSession, NewChatSession } from '@/types/chat';

export interface ChatRepository {
  listSessions(): Promise<ChatSession[]>;
  createSession(session: NewChatSession): Promise<void>;
  updateSession(id: string, patch: { updatedAt?: string; pinned?: boolean }): Promise<void>;
  deleteSession(id: string): Promise<void>;
  listMessages(sessionId: string): Promise<ChatMessage[]>;
  addMessage(message: ChatMessage): Promise<void>;
  getPerfect10SessionId(sessionId: string): Promise<string | null>;
  setPerfect10SessionId(sessionId: string, perfect10SessionId: string): Promise<void>;
}
