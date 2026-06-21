import type { ChatMessage, ChatSession } from '@/types/chat';

export interface ChatRepository {
  listSessions(): Promise<ChatSession[]>;
  createSession(session: ChatSession): Promise<void>;
  updateSession(id: string, patch: { updatedAt?: string; pinned?: boolean }): Promise<void>;
  deleteSession(id: string): Promise<void>;
  listMessages(sessionId: string): Promise<ChatMessage[]>;
  addMessage(message: ChatMessage): Promise<void>;
}
