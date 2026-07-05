import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';

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
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export * from './auth-schema';
