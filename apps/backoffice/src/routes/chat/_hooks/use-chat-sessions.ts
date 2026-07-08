import { useEffect } from 'react';
import { toast } from 'sonner';
import { useChatStore, chatStoreActions } from '@/routes/chat/_hooks/chat-store';
import { useChatRepository } from '@/routes/chat/_apis/chat-repository-context';

export function useChatSessions() {
  const repo = useChatRepository();
  const sessions = useChatStore((state) => state.sessions);
  const activeChatId = useChatStore((state) => state.activeChatId);

  useEffect(() => {
    repo.listSessions()
      .then((list) => chatStoreActions.setSessions(list))
      .catch(() => toast.error('Failed to load chat sessions'));
  }, [repo]);

  async function selectChat(chatId: string) {
    chatStoreActions.setActiveChat(chatId);
    chatStoreActions.setLoadingMessages(true);
    try {
      const messages = await repo.listMessages(chatId);
      chatStoreActions.setMessages(chatId, messages);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      chatStoreActions.setLoadingMessages(false);
    }
  }

  function newChat() {
    chatStoreActions.setActiveChat(null);
  }

  async function deleteChat(chatId: string) {
    try {
      await repo.deleteSession(chatId);
      chatStoreActions.removeSession(chatId);
      if (activeChatId === chatId) chatStoreActions.setActiveChat(null);
      toast.success('Chat deleted');
    } catch {
      toast.error('Failed to delete chat');
    }
  }

  async function togglePin(chatId: string) {
    const session = sessions.find((s) => s.id === chatId);
    if (!session) return;
    const prevPinned = session.pinned;
    chatStoreActions.togglePinSession(chatId);
    try {
      await repo.updateSession(chatId, { pinned: !prevPinned });
    } catch {
      chatStoreActions.togglePinSession(chatId); // rollback
      toast.error('Failed to toggle pin');
    }
  }

  async function renameChat(chatId: string, title: string) {
    const session = sessions.find((s) => s.id === chatId);
    if (!session) return;
    const prevTitle = session.title;
    chatStoreActions.renameSession(chatId, title);
    try {
      await repo.updateSession(chatId, { title });
      toast.success('Chat renamed');
    } catch {
      chatStoreActions.renameSession(chatId, prevTitle); // rollback
      toast.error('Failed to rename chat');
    }
  }

  return { sessions, activeChatId, selectChat, newChat, deleteChat, togglePin, renameChat };
}
