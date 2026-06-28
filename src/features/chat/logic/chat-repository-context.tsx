import { useStore } from '@tanstack/react-store';
import type { ReactNode } from 'react';
import type { ChatRepository } from '@/services/chat-repository';
import { chatRepositoryStore } from '@/stores/chat-repository-store';
import { chatRepository } from '@/features/chat/logic/chat-repository-instance';

export function ChatRepositoryProvider({
  value = chatRepository,
  children,
}: {
  value?: ChatRepository;
  children: ReactNode;
}) {
  if (value !== chatRepositoryStore.state) {
    chatRepositoryStore.setState(() => value);
  }
  return <>{children}</>;
}

export function useChatRepository(): ChatRepository {
  return useStore(chatRepositoryStore);
}
