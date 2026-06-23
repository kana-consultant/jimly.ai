import { useCallback, useEffect } from 'react';
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
  }, []);

  const newChat = useCallback(() => setActiveChat(null), [setActiveChat]);

  const deleteChat = useCallback(
    async (chatId: string) => {
      await chatRepository.deleteSession(chatId);
      removeSession(chatId);
      if (activeChatId === chatId) setActiveChat(null);
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
      renameSession(chatId, title);
      await chatRepository.updateSession(chatId, { title });
    },
    [renameSession],
  );

  return { sessions, activeChatId, selectChat, newChat, deleteChat, togglePin, renameChat };
}
