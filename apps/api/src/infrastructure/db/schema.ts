import { pgTable, text, boolean, timestamp, unique } from 'drizzle-orm/pg-core';

export const chatSessions = pgTable('chat_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  pinned: boolean('pinned').notNull().default(false),
  perfect10SessionId: text('perfect10_session_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => chatSessions.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  role: text('role').notNull(), // 'user' | 'assistant' | 'system'
  content: text('content').notNull(),
  status: text('status').notNull().default('completed'), // 'processing' | 'completed' | 'failed'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const messageFeedback = pgTable(
  'message_feedback',
  {
    id: text('id').primaryKey(),
    messageId: text('message_id').notNull().references(() => chatMessages.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    value: text('value').notNull(), // 'up' | 'down'
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('message_feedback_message_user_uniq').on(t.messageId, t.userId)],
);

export * from './auth-schema';
