import { useCallback, useEffect } from 'react';
import { useChatStore } from '@/pages/chat/logic/chat-store';
import { chatRepository } from '@/pages/chat/logic/chat-repository-instance';

export function useChatSessions() {
  const sessions = useChatStore((state) => state.sessions);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const setSessions = useChatStore((state) => state.setSessions);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const setMessages = useChatStore((state) => state.setMessages);
  const removeSession = useChatStore((state) => state.removeSession);

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
      if (list.length > 0) selectChat(list[0].id);
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

  return { sessions, activeChatId, selectChat, newChat, deleteChat };
}
