import { create } from 'zustand';
import type { ChatMessage, ChatSession } from '@/types/chat';

interface ChatState {
  sessions: ChatSession[];
  activeChatId: string | null;
  messagesByChatId: Record<string, ChatMessage[]>;
  isStreaming: boolean;
  setActiveChat: (chatId: string | null) => void;
  setSessions: (sessions: ChatSession[]) => void;
  addSession: (session: ChatSession) => void;
  removeSession: (chatId: string) => void;
  togglePinSession: (chatId: string) => void;
  renameSession: (chatId: string, title: string) => void;
  setMessages: (chatId: string, messages: ChatMessage[]) => void;
  addMessage: (chatId: string, message: ChatMessage) => void;
  appendToLastMessage: (chatId: string, chunk: string) => void;
  removeLastMessage: (chatId: string) => void;
  setStreaming: (isStreaming: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  sessions: [],
  activeChatId: null,
  messagesByChatId: {},
  isStreaming: false,

  setActiveChat: (chatId) => set({ activeChatId: chatId }),

  setSessions: (sessions) => set({ sessions }),

  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions] })),

  removeSession: (chatId) =>
    set((state) => {
      const { [chatId]: _removed, ...messagesByChatId } = state.messagesByChatId;
      return {
        sessions: state.sessions.filter((s) => s.id !== chatId),
        messagesByChatId,
      };
    }),

  togglePinSession: (chatId) =>
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === chatId ? { ...s, pinned: !s.pinned } : s)),
    })),

  renameSession: (chatId, title) =>
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === chatId ? { ...s, title } : s)),
    })),

  setMessages: (chatId, messages) =>
    set((state) => ({
      messagesByChatId: { ...state.messagesByChatId, [chatId]: messages },
    })),

  addMessage: (chatId, message) =>
    set((state) => ({
      messagesByChatId: {
        ...state.messagesByChatId,
        [chatId]: [...(state.messagesByChatId[chatId] ?? []), message],
      },
    })),

  appendToLastMessage: (chatId, chunk) =>
    set((state) => {
      const messages = state.messagesByChatId[chatId] ?? [];
      if (messages.length === 0) return state;
      const last = messages[messages.length - 1];
      const updated = { ...last, content: last.content + chunk };
      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: [...messages.slice(0, -1), updated],
        },
      };
    }),

  removeLastMessage: (chatId) =>
    set((state) => {
      const messages = state.messagesByChatId[chatId] ?? [];
      if (messages.length === 0) return state;
      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: messages.slice(0, -1),
        },
      };
    }),

  setStreaming: (isStreaming) => set({ isStreaming }),
}));
