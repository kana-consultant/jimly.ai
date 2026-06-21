import type { SupabaseClient } from '@supabase/supabase-js';
import { getSessionUserId } from '@/services/session-manager';
import type { ChatRepository } from '@/services/chat-repository';
import type { ChatMessage, ChatRole, ChatSession } from '@/types/chat';

interface SessionRow {
  id: string;
  user_id: string;
  title: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

interface MessageRow {
  id: string;
  session_id: string;
  role: ChatRole;
  content: string;
  created_at: string;
}

function toSession(row: SessionRow): ChatSession {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    pinned: row.pinned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toMessage(row: MessageRow): ChatMessage {
  return { id: row.id, sessionId: row.session_id, role: row.role, content: row.content, createdAt: row.created_at };
}

export function createSupabaseChatRepository(supabase: SupabaseClient): ChatRepository {
  return {
    async listSessions() {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error || !data) return [];
      return data.map(toSession);
    },

    async createSession(session) {
      const userId = await getSessionUserId(supabase);
      if (!userId) return;
      await supabase.from('chat_sessions').insert({
        id: session.id,
        user_id: userId,
        title: session.title,
        pinned: session.pinned,
        created_at: session.createdAt,
        updated_at: session.updatedAt,
      });
    },

    async updateSession(id, patch) {
      const update: { updated_at?: string; pinned?: boolean } = {};
      if (patch.updatedAt !== undefined) update.updated_at = patch.updatedAt;
      if (patch.pinned !== undefined) update.pinned = patch.pinned;
      await supabase.from('chat_sessions').update(update).eq('id', id);
    },

    async deleteSession(id) {
      await supabase.from('chat_sessions').delete().eq('id', id);
    },

    async listMessages(sessionId) {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      if (error || !data) return [];
      return data.map(toMessage);
    },

    async addMessage(message) {
      const userId = await getSessionUserId(supabase);
      if (!userId) return;
      await supabase.from('chat_messages').insert({
        id: message.id,
        session_id: message.sessionId,
        user_id: userId,
        role: message.role,
        content: message.content,
        created_at: message.createdAt,
      });
    },

    async getPerfect10SessionId(sessionId) {
      const { data } = await supabase
        .from('chat_sessions')
        .select('perfect10_session_id')
        .eq('id', sessionId)
        .single();
      return data?.perfect10_session_id ?? null;
    },

    async setPerfect10SessionId(sessionId, perfect10SessionId) {
      await supabase.from('chat_sessions').update({ perfect10_session_id: perfect10SessionId }).eq('id', sessionId);
    },
  };
}
