import { eq, and, asc, desc, sql, inArray } from 'drizzle-orm';
import type { db as Db } from '#/infrastructure/db/client';
import { chatSessions, chatMessages, messageFeedback } from '#/infrastructure/db/schema';
import type { ChatRepository } from '#/domain/chat/chat-repository';
import type { ChatMessage, ChatRole, ChatSession, FeedbackValue, MessageFeedback } from '#/domain/chat/chat';
import { forbidden } from '#/application/shared/errors';

export function createNeonChatRepository(db: typeof Db, userId: string): ChatRepository {
  const ownedSession = (id: string) => and(eq(chatSessions.id, id), eq(chatSessions.userId, userId));

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
      await db
        .update(chatSessions)
        .set({
          ...(patch.updatedAt !== undefined && { updatedAt: new Date(patch.updatedAt) }),
          ...(patch.pinned !== undefined && { pinned: patch.pinned }),
          ...(patch.title !== undefined && { title: patch.title }),
        })
        .where(ownedSession(id));
    },
    async deleteSession(id) {
      await db.delete(chatSessions).where(ownedSession(id));
    },
    async listMessages(sessionId) {
      const rows = await db
        .select({
          id: chatMessages.id,
          sessionId: chatMessages.sessionId,
          role: chatMessages.role,
          content: chatMessages.content,
          status: chatMessages.status,
          createdAt: chatMessages.createdAt,
          feedbackValue: messageFeedback.value,
        })
        .from(chatMessages)
        .leftJoin(
          messageFeedback,
          and(eq(messageFeedback.messageId, chatMessages.id), eq(messageFeedback.userId, userId)),
        )
        .where(and(eq(chatMessages.sessionId, sessionId), eq(chatMessages.userId, userId)))
        .orderBy(asc(chatMessages.createdAt));
      return rows.map(
        (r): ChatMessage => ({
          id: r.id,
          sessionId: r.sessionId,
          role: r.role as ChatRole,
          content: r.content,
          status: r.status as ChatMessage['status'],
          ...(r.feedbackValue ? { feedback: r.feedbackValue as FeedbackValue } : {}),
          createdAt: r.createdAt.toISOString(),
        }),
      );
    },
    async addMessage(message) {
      const result = await db.execute(sql`
        INSERT INTO ${chatMessages} (id, session_id, user_id, role, content, status, created_at)
        SELECT ${message.id}, ${message.sessionId}, ${userId}, ${message.role}, ${message.content}, ${message.status ?? 'completed'}, ${new Date(message.createdAt)}
        WHERE EXISTS (
          SELECT 1 FROM ${chatSessions}
          WHERE ${chatSessions.id} = ${message.sessionId} AND ${chatSessions.userId} = ${userId}
        )
      `);
      if (result.rowCount === 0) throw forbidden('Not your session');
    },
    async updateMessage(id, patch) {
      await db
        .update(chatMessages)
        .set({
          ...(patch.content !== undefined && { content: patch.content }),
          ...(patch.status !== undefined && { status: patch.status }),
        })
        .where(and(eq(chatMessages.id, id), eq(chatMessages.userId, userId)));
    },
    async upsertFeedback(feedback) {
      await db
        .insert(messageFeedback)
        .values({
          id: feedback.id,
          messageId: feedback.messageId,
          userId,
          value: feedback.value,
          createdAt: new Date(feedback.createdAt),
        })
        .onConflictDoUpdate({
          target: [messageFeedback.messageId, messageFeedback.userId],
          set: { value: feedback.value },
        });
    },
    async deleteFeedback(messageId) {
      await db
        .delete(messageFeedback)
        .where(and(eq(messageFeedback.messageId, messageId), eq(messageFeedback.userId, userId)));
    },
    async listFeedbackByUser(messageIds) {
      if (messageIds.length === 0) return [];
      const rows = await db
        .select()
        .from(messageFeedback)
        .where(and(inArray(messageFeedback.messageId, messageIds), eq(messageFeedback.userId, userId)));
      return rows.map(
        (r): MessageFeedback => ({
          id: r.id,
          messageId: r.messageId,
          userId: r.userId,
          value: r.value as FeedbackValue,
          createdAt: r.createdAt.toISOString(),
        }),
      );
    },
    async getPerfect10SessionId(sessionId) {
      // SECURITY: scope by userId — else a user could hijack another's Perfect10 session
      const [row] = await db
        .select({ pid: chatSessions.perfect10SessionId })
        .from(chatSessions)
        .where(ownedSession(sessionId));
      return row?.pid ?? null;
    },
    async setPerfect10SessionId(sessionId, perfect10SessionId) {
      await db
        .update(chatSessions)
        .set({ perfect10SessionId })
        .where(ownedSession(sessionId));
    },
  };
}
