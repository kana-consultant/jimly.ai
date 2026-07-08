export type ChatRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'processing' | 'completed' | 'failed';
export type FeedbackValue = 'up' | 'down';

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  status: MessageStatus;
  feedback?: FeedbackValue;
  createdAt: string;
}

export interface MessageFeedback {
  id: string;
  messageId: string;
  userId: string;
  value: FeedbackValue;
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
