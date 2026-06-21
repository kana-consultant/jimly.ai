import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) return redirect('/login?error=oauth_failed');

  const supabase = createSupabaseServerClient(cookies, request);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) return redirect('/login?error=oauth_failed');
  return redirect('/chat');
};
