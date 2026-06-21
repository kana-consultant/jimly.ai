import type { User, AuthCredentials } from '@/types/auth';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type AuthApiResult = { user: User } | { error: string };

async function postAuth(path: string, body?: AuthCredentials): Promise<AuthApiResult> {
  const res = await fetch(`/api/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export function registerUser(credentials: AuthCredentials) {
  return postAuth('register', credentials);
}

export function loginUser(credentials: AuthCredentials) {
  return postAuth('login', credentials);
}

export async function logoutUser(): Promise<{ ok?: boolean; error?: string }> {
  const res = await fetch('/api/auth/logout', { method: 'POST' });
  return res.json();
}

export async function signInWithGoogle(): Promise<{ error?: string }> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/api/auth/callback` },
  });
  return error ? { error: error.message } : {};
}
