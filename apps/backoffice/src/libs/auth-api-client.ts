import type { User, AuthCredentials } from '@/libs/auth/types';
import { signIn, signUp, signOut } from '@/libs/auth/client';

type AuthApiResult = { user: User } | { error: string };

export async function registerUser(c: AuthCredentials): Promise<AuthApiResult> {
  const { data, error } = await signUp.email({ email: c.email, password: c.password, name: c.email });
  if (error) return { error: error.message ?? 'Registration failed' };
  return { user: { id: data!.user.id, email: data!.user.email, createdAt: '' } };
}

export async function loginUser(c: AuthCredentials): Promise<AuthApiResult> {
  const { data, error } = await signIn.email({ email: c.email, password: c.password });
  if (error) return { error: error.message ?? 'Login failed' };
  return { user: { id: data!.user.id, email: data!.user.email, createdAt: '' } };
}

export async function logoutUser() {
  await signOut();
  return { ok: true };
}
