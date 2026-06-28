import { Store } from '@tanstack/react-store';
import type { ChatRepository } from '@/services/chat-repository';
import { chatRepository } from '@/features/chat/logic/chat-repository-instance';

export const chatRepositoryStore = new Store<ChatRepository>(chatRepository);
