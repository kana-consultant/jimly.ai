import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useChatStore } from '@/features/chat/logic/chat-store';
import { chatRepository } from '@/features/chat/logic/chat-repository-instance';

export function useChatSessions() {
  const sessions = useChatStore((state) => state.sessions);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const setSessions = useChatStore((state) => state.setSessions);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const setMessages = useChatStore((state) => state.setMessages);
  const removeSession = useChatStore((state) => state.removeSession);
  const togglePinSession = useChatStore((state) => state.togglePinSession);
  const renameSession = useChatStore((state) => state.renameSession);

  const selectChat = useCallback(
    async (chatId: string) => {
      setActiveChat(chatId);
      const messages = await chatRepository.listMessages(chatId);
      setMessages(chatId, messages);
    },
    [setActiveChat, setMessages],
  );

  useEffect(() => {
    chatRepository.listSessions().then((list) => {
      setSessions(list);
    });
  }, [setSessions]);

  const newChat = useCallback(() => setActiveChat(null), [setActiveChat]);

  const deleteChat = useCallback(
    async (chatId: string) => {
      try {
        await chatRepository.deleteSession(chatId);
        removeSession(chatId);
        if (activeChatId === chatId) setActiveChat(null);
        toast.success('Chat deleted');
      } catch {
        toast.error('Failed to delete chat');
      }
    },
    [activeChatId, removeSession, setActiveChat],
  );

  const togglePin = useCallback(
    async (chatId: string) => {
      const session = sessions.find((s) => s.id === chatId);
      if (!session) return;
      togglePinSession(chatId);
      await chatRepository.updateSession(chatId, { pinned: !session.pinned });
    },
    [sessions, togglePinSession],
  );

  const renameChat = useCallback(
    async (chatId: string, title: string) => {
      try {
        renameSession(chatId, title);
        await chatRepository.updateSession(chatId, { title });
        toast.success('Chat renamed');
      } catch {
        toast.error('Failed to rename chat');
      }
    },
    [renameSession],
  );

  return { sessions, activeChatId, selectChat, newChat, deleteChat, togglePin, renameChat };
}
