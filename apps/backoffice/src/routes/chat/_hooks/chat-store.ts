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
  streamingContent: string | null;
  streamingMessageId: string | null;
}

const initialState: ChatState = {
  sessions: [],
  activeChatId: null,
  messagesByChatId: {},
  isStreaming: false,
  isPending: false,
  isLoadingMessages: false,
  lastAttempt: null,
  streamingContent: null,
  streamingMessageId: null,
};

const store = new Store<ChatState>(initialState);

function mergeMessageArrays(existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const byId = new Map(existing.map((m) => [m.id, m]));
  const merged = incoming.map((m) => {
    const prev = byId.get(m.id);
    if (!prev) return m;
    return prev.content === m.content && prev.status === m.status && prev.feedback === m.feedback
      ? prev
      : { ...prev, ...m };
  });
  return merged.length === existing.length && merged.every((m, i) => m === existing[i])
    ? existing
    : merged;
}

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

  mergeMessages: (chatId: string, incoming: ChatMessage[]) =>
    store.setState((state) => {
      const existing = state.messagesByChatId[chatId] ?? [];
      const merged = mergeMessageArrays(existing, incoming);
      if (merged === existing) return state;
      return { ...state, messagesByChatId: { ...state.messagesByChatId, [chatId]: merged } };
    }),

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

  setMessageFeedback: (chatId: string, messageId: string, value: FeedbackValue | null) =>
    store.setState((state) => ({
      ...state,
      messagesByChatId: {
        ...state.messagesByChatId,
        [chatId]: (state.messagesByChatId[chatId] ?? []).map((m) =>
          m.id === messageId ? { ...m, feedback: value ?? undefined } : m,
        ),
      },
    })),

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

  setStreamingContent: (streamingContent: string | null) =>
    store.setState((state) => ({ ...state, streamingContent })),

  setStreamingMessageId: (streamingMessageId: string | null) =>
    store.setState((state) => ({ ...state, streamingMessageId })),
};

export function useChatStore<T>(selector: (state: ChatState & typeof actions) => T): T {
  return useStore(store, (state) => selector({ ...state, ...actions }));
}

export const chatStore = store;
export const chatStoreActions = actions;
