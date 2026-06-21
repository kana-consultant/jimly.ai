-- Run manually in Supabase SQL Editor (same pattern as chat_sessions, phase 0).
create table if not exists chat_messages (
  id uuid primary key,
  session_id uuid not null references chat_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table chat_messages enable row level security;

create policy "own rows" on chat_messages
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
