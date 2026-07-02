import { eq, and, asc, desc, sql } from 'drizzle-orm';
import type { db as Db } from '#/infrastructure/db/client';
import { chatSessions, chatMessages } from '#/infrastructure/db/schema';
import type { ChatRepository } from '#/domain/chat/chat-repository';
import type { ChatMessage, ChatRole, ChatSession } from '#/domain/chat/chat';
import { forbidden } from '#/application/shared/errors';

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
      // SECURITY: single guarded INSERT instead of select-then-insert — closes
      // the TOCTOU race where ownership could change between the check and the write.
      const result = await db.execute(sql`
        INSERT INTO ${chatMessages} (id, session_id, user_id, role, content, created_at)
        SELECT ${message.id}, ${message.sessionId}, ${userId}, ${message.role}, ${message.content}, ${new Date(message.createdAt)}
        WHERE EXISTS (
          SELECT 1 FROM ${chatSessions}
          WHERE ${chatSessions.id} = ${message.sessionId} AND ${chatSessions.userId} = ${userId}
        )
      `);
      if (result.rowCount === 0) throw forbidden('Not your session');
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
