import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAuthRepository } from '@/services/supabase-auth-repository';
import { validateEmail, validatePassword } from '@/lib/validate-auth-input';

export const POST: APIRoute = async ({ request, cookies }) => {
  const { email, password } = await request.json();

  const emailCheck = validateEmail(email);
  if (!emailCheck.ok) return Response.json({ error: emailCheck.error }, { status: 400 });

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.ok) return Response.json({ error: passwordCheck.error }, { status: 400 });

  const supabase = createSupabaseServerClient(cookies);
  const result = await createSupabaseAuthRepository(supabase).login({ email, password });

  if ('error' in result) return Response.json({ error: result.error }, { status: 401 });
  return Response.json({ user: result.user });
};
