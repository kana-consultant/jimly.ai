import type { SupabaseClient } from '@supabase/supabase-js';

export async function getSessionUserId(supabase: SupabaseClient): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function getSessionUser(
  supabase: SupabaseClient,
): Promise<{ id: string; email: string; name?: string } | null> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return { id: data.user.id, email: data.user.email ?? '', name: data.user.user_metadata?.name };
}
