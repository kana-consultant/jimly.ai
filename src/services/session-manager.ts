import type { SupabaseClient } from '@supabase/supabase-js';

export async function getSessionUserId(supabase: SupabaseClient): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}
