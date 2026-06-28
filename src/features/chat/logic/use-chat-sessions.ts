import { useChatStore } from '@/features/chat/logic/chat-store';
import { chatRepository } from '@/features/chat/logic/chat-repository-instance';

let initialised = false;

export function useChatSessions() {
  const sessions = useChatStore((state) => state.sessions);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const setSessions = useChatStore((state) => state.setSessions);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const setMessages = useChatStore((state) => state.setMessages);
  const removeSession = useChatStore((state) => state.removeSession);
  const togglePinSession = useChatStore((state) => state.togglePinSession);
  const renameSession = useChatStore((state) => state.renameSession);

  if (!initialised) {
    initialised = true;
    chatRepository.listSessions().then((list) => {
      setSessions(list);
    });
  }

  async function selectChat(chatId: string) {
    setActiveChat(chatId);
    const messages = await chatRepository.listMessages(chatId);
    setMessages(chatId, messages);
  }

  function newChat() { setActiveChat(null); }

  async function deleteChat(chatId: string) {
    await chatRepository.deleteSession(chatId);
    removeSession(chatId);
    if (activeChatId === chatId) setActiveChat(null);
  }

  async function togglePin(chatId: string) {
    const session = sessions.find((s) => s.id === chatId);
    if (!session) return;
    togglePinSession(chatId);
    await chatRepository.updateSession(chatId, { pinned: !session.pinned });
  }

  async function renameChat(chatId: string, title: string) {
    renameSession(chatId, title);
    await chatRepository.updateSession(chatId, { title });
  }

  return { sessions, activeChatId, selectChat, newChat, deleteChat, togglePin, renameChat };
}
