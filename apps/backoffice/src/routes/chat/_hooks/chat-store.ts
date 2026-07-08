import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import type { ChatMessage, ChatSession, FeedbackValue } from '@/routes/chat/types';

interface ChatState {
  sessions: ChatSession[];
  activeChatId: string | null;
  messagesByChatId: Record<string, ChatMessage[]>;
  isStreaming: boolean;
  isPending: boolean;
  isLoadingMessages: boolean;
  lastAttempt: { chatId: string; content: string } | null;
}

const initialState: ChatState = {
  sessions: [],
  activeChatId: null,
  messagesByChatId: {},
  isStreaming: false,
  isPending: false,
  isLoadingMessages: false,
  lastAttempt: null,
};

const store = new Store<ChatState>(initialState);

const actions = {
  setActiveChat: (chatId: string | null) =>
    store.setState((state) => ({ ...state, activeChatId: chatId })),

  setSessions: (sessions: ChatSession[]) =>
    store.setState((state) => ({ ...state, sessions })),

  addSession: (session: ChatSession) =>
    store.setState((state) => ({ ...state, sessions: [session, ...state.sessions] })),

  removeSession: (chatId: string) =>
    store.setState((state) => {
      const { [chatId]: _removed, ...messagesByChatId } = state.messagesByChatId;
      return {
        ...state,
        sessions: state.sessions.filter((s) => s.id !== chatId),
        messagesByChatId,
      };
    }),

  togglePinSession: (chatId: string) =>
    store.setState((state) => ({
      ...state,
      sessions: state.sessions.map((s) => (s.id === chatId ? { ...s, pinned: !s.pinned } : s)),
    })),

  renameSession: (chatId: string, title: string) =>
    store.setState((state) => ({
      ...state,
      sessions: state.sessions.map((s) => (s.id === chatId ? { ...s, title } : s)),
    })),

  setMessages: (chatId: string, messages: ChatMessage[]) =>
    store.setState((state) => ({
      ...state,
      messagesByChatId: { ...state.messagesByChatId, [chatId]: messages },
    })),

  addMessage: (chatId: string, message: ChatMessage) =>
    store.setState((state) => ({
      ...state,
      messagesByChatId: {
        ...state.messagesByChatId,
        [chatId]: [...(state.messagesByChatId[chatId] ?? []), message],
      },
    })),

  appendToLastMessage: (chatId: string, chunk: string) =>
    store.setState((state) => {
      const messages = state.messagesByChatId[chatId] ?? [];
      if (messages.length === 0) return state;
      const last = messages[messages.length - 1]!;
      const updated = { ...last, content: last.content + chunk };
      return {
        ...state,
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: [...messages.slice(0, -1), updated],
        },
      };
    }),

  removeLastMessage: (chatId: string) =>
    store.setState((state) => {
      const messages = state.messagesByChatId[chatId] ?? [];
      if (messages.length === 0) return state;
      return {
        ...state,
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: messages.slice(0, -1),
        },
      };
    }),

  removeMessage: (chatId: string, messageId: string) =>
    store.setState((state) => ({
      ...state,
      messagesByChatId: {
        ...state.messagesByChatId,
        [chatId]: (state.messagesByChatId[chatId] ?? []).filter((m) => m.id !== messageId),
      },
    })),

  setMessageFeedback: (messageId: string, value: FeedbackValue | null) =>
    store.setState((state) => {
      const updated: Record<string, ChatMessage[]> = {};
      for (const [chatId, msgs] of Object.entries(state.messagesByChatId)) {
        updated[chatId] = msgs.map((m) =>
          m.id === messageId ? { ...m, feedback: value ?? undefined } : m,
        );
      }
      return { ...state, messagesByChatId: updated };
    }),

  updateMessage: (chatId: string, messageId: string, patch: Partial<ChatMessage>) =>
    store.setState((state) => ({
      ...state,
      messagesByChatId: {
        ...state.messagesByChatId,
        [chatId]: (state.messagesByChatId[chatId] ?? []).map((m) =>
          m.id === messageId ? { ...m, ...patch } : m,
        ),
      },
    })),

  setStreaming: (isStreaming: boolean) =>
    store.setState((state) => ({ ...state, isStreaming })),

  setPending: (isPending: boolean) =>
    store.setState((state) => ({ ...state, isPending })),

  setLoadingMessages: (isLoadingMessages: boolean) =>
    store.setState((state) => ({ ...state, isLoadingMessages })),

  setLastAttempt: (lastAttempt: { chatId: string; content: string } | null) =>
    store.setState((state) => ({ ...state, lastAttempt })),
};

export function useChatStore<T>(selector: (state: ChatState & typeof actions) => T): T {
  return useStore(store, (state) => selector({ ...state, ...actions }));
}

export const chatStore = store;
export const chatStoreActions = actions;
