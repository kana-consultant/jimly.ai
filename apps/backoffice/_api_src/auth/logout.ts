import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAuthRepository } from '@/services/supabase-auth-repository';

export const POST: APIRoute = async ({ cookies, request }) => {
  const supabase = createSupabaseServerClient(cookies, request);
  const result = await createSupabaseAuthRepository(supabase).logout();

  if (result.error) return Response.json({ error: result.error }, { status: 400 });
  return Response.json({ ok: true });
};
