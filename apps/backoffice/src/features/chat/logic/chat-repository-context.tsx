import type { ReactNode } from 'react';
import type { ChatRepository } from '@/services/chat-repository';
import { chatRepository } from '@/features/chat/logic/chat-repository-instance';

let activeRepository: ChatRepository = chatRepository;

export function ChatRepositoryProvider({
  value = chatRepository,
  children,
}: {
  value?: ChatRepository;
  children: ReactNode;
}) {
  activeRepository = value;
  return children;
}

export function useChatRepository(): ChatRepository {
  return activeRepository;
}
