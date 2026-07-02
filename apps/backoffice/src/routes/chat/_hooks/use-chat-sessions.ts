import { toast } from 'sonner';
import { useChatStore } from '@/routes/chat/_hooks/chat-store';
import { chatRepository } from '@/routes/chat/_apis/chat-repository-instance';

let sessionsLoaded = false;

export function useChatSessions() {
  const sessions = useChatStore((state) => state.sessions);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const setSessions = useChatStore((state) => state.setSessions);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const setMessages = useChatStore((state) => state.setMessages);
  const removeSession = useChatStore((state) => state.removeSession);
  const togglePinSession = useChatStore((state) => state.togglePinSession);
  const renameSession = useChatStore((state) => state.renameSession);

  if (!sessionsLoaded) {
    sessionsLoaded = true;
    chatRepository.listSessions().then((list) => {
      setSessions(list);
    });
  }

  async function selectChat(chatId: string) {
    setActiveChat(chatId);
    const messages = await chatRepository.listMessages(chatId);
    setMessages(chatId, messages);
  }

  function newChat() {
    setActiveChat(null);
  }

  async function deleteChat(chatId: string) {
    try {
      await chatRepository.deleteSession(chatId);
      removeSession(chatId);
      if (activeChatId === chatId) setActiveChat(null);
      toast.success('Chat deleted');
    } catch {
      toast.error('Failed to delete chat');
    }
  }

  async function togglePin(chatId: string) {
    const session = sessions.find((s) => s.id === chatId);
    if (!session) return;
    const prevPinned = session.pinned;
    togglePinSession(chatId);
    try {
      await chatRepository.updateSession(chatId, { pinned: !prevPinned });
    } catch {
      togglePinSession(chatId); // rollback
      toast.error('Failed to toggle pin');
    }
  }

  async function renameChat(chatId: string, title: string) {
    const session = sessions.find((s) => s.id === chatId);
    if (!session) return;
    const prevTitle = session.title;
    renameSession(chatId, title);
    try {
      await chatRepository.updateSession(chatId, { title });
      toast.success('Chat renamed');
    } catch {
      renameSession(chatId, prevTitle); // rollback
      toast.error('Failed to rename chat');
    }
  }

  return { sessions, activeChatId, selectChat, newChat, deleteChat, togglePin, renameChat };
}
