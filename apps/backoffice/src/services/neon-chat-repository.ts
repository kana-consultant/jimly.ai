import { eq, and, asc, desc } from 'drizzle-orm';
import type { db as Db } from '@/db/client';
import { chatSessions, chatMessages } from '@/db/schema';
import type { ChatRepository } from '@/services/chat-repository';
import type { ChatMessage, ChatRole, ChatSession } from '@/types/chat';

export function createNeonChatRepository(db: typeof Db, userId: string): ChatRepository {
  return {
    async listSessions() {
      const rows = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.userId, userId))
        .orderBy(desc(chatSessions.updatedAt));
      return rows.map(
        (r): ChatSession => ({
          id: r.id,
          userId: r.userId,
          title: r.title,
          pinned: r.pinned,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        }),
      );
    },
    async createSession(session) {
      await db.insert(chatSessions).values({
        id: session.id,
        userId,
        title: session.title,
        pinned: session.pinned,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
      });
    },
    async updateSession(id, patch) {
      const update: Record<string, unknown> = {};
      if (patch.updatedAt !== undefined) update.updatedAt = new Date(patch.updatedAt);
      if (patch.pinned !== undefined) update.pinned = patch.pinned;
      if (patch.title !== undefined) update.title = patch.title;
      await db
        .update(chatSessions)
        .set(update)
        .where(and(eq(chatSessions.id, id), eq(chatSessions.userId, userId)));
    },
    async deleteSession(id) {
      await db.delete(chatSessions).where(and(eq(chatSessions.id, id), eq(chatSessions.userId, userId)));
    },
    async listMessages(sessionId) {
      // SECURITY: scope by userId — messages carry user_id; without this any user reads any session (IDOR)
      const rows = await db
        .select()
        .from(chatMessages)
        .where(and(eq(chatMessages.sessionId, sessionId), eq(chatMessages.userId, userId)))
        .orderBy(asc(chatMessages.createdAt));
      return rows.map(
        (r): ChatMessage => ({
          id: r.id,
          sessionId: r.sessionId,
          role: r.role as ChatRole,
          content: r.content,
          createdAt: r.createdAt.toISOString(),
        }),
      );
    },
    async addMessage(message) {
      // SECURITY: verify caller owns the parent session before writing into it
      const [owner] = await db
        .select({ id: chatSessions.id })
        .from(chatSessions)
        .where(and(eq(chatSessions.id, message.sessionId), eq(chatSessions.userId, userId)));
      if (!owner) throw new Error('Forbidden');
      await db.insert(chatMessages).values({
        id: message.id,
        sessionId: message.sessionId,
        userId,
        role: message.role,
        content: message.content,
        createdAt: new Date(message.createdAt),
      });
    },
    async getPerfect10SessionId(sessionId) {
      // SECURITY: scope by userId — else a user could hijack another's Perfect10 session
      const [row] = await db
        .select({ pid: chatSessions.perfect10SessionId })
        .from(chatSessions)
        .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, userId)));
      return row?.pid ?? null;
    },
    async setPerfect10SessionId(sessionId, perfect10SessionId) {
      await db
        .update(chatSessions)
        .set({ perfect10SessionId })
        .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, userId)));
    },
  };
}
