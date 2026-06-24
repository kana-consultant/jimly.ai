import type { User, AuthCredentials } from '@/types/auth';

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
