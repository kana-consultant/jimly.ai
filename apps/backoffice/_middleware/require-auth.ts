import type { APIContext } from 'astro';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/services/session-manager';

export async function requireAuth(context: APIContext): Promise<Response | null> {
  const supabase = createSupabaseServerClient(context.cookies, context.request);
  const user = await getSessionUser(supabase);

  if (!user) return context.redirect('/login');

  context.locals.userId = user.id;
  context.locals.email = user.email;
  context.locals.name = user.name;
  return null;
}
