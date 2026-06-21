-- Run manually in Supabase SQL Editor (same pattern as chat_sessions/chat_messages).
alter table chat_sessions add column if not exists perfect10_session_id text;
