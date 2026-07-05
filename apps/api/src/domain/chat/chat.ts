export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

/** userId set server-side; clients never know the real value. */
export type NewChatSession = Omit<ChatSession, 'userId'>;
