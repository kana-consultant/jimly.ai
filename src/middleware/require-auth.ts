import type { APIContext } from 'astro';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSessionUserId } from '@/services/session-manager';

export async function requireAuth(context: APIContext): Promise<Response | null> {
  const supabase = createSupabaseServerClient(context.cookies);
  const userId = await getSessionUserId(supabase);

  if (!userId) return context.redirect('/login');

  context.locals.userId = userId;
  return null;
}
