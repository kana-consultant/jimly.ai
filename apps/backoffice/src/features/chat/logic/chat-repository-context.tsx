import { createContext, useContext, type ReactNode } from 'react';
import type { ChatRepository } from '@/services/chat-repository';
import { chatRepository } from '@/features/chat/logic/chat-repository-instance';

const ChatRepositoryContext = createContext<ChatRepository>(chatRepository);

export function ChatRepositoryProvider({
  value = chatRepository,
  children,
}: {
  value?: ChatRepository;
  children: ReactNode;
}) {
  return <ChatRepositoryContext.Provider value={value}>{children}</ChatRepositoryContext.Provider>;
}

export function useChatRepository(): ChatRepository {
  return useContext(ChatRepositoryContext);
}
