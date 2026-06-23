import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthRepository } from '@/services/auth-repository';
import type { User, AuthCredentials } from '@/types/auth';

function toUser(supabaseUser: {
  id: string;
  email?: string;
  created_at: string;
  user_metadata?: { name?: string };
}): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    name: supabaseUser.user_metadata?.name,
    createdAt: supabaseUser.created_at,
  };
}

export function createSupabaseAuthRepository(supabase: SupabaseClient): AuthRepository {
  return {
    async register({ email, password, name }: AuthCredentials) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: name ? { data: { name } } : undefined,
      });
      if (error || !data.user) return { error: error?.message ?? 'Registration failed' };
      return { user: toUser(data.user) };
    },

    async login({ email, password }: AuthCredentials) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) return { error: error?.message ?? 'Login failed' };
      return { user: toUser(data.user) };
    },

    async logout() {
      const { error } = await supabase.auth.signOut();
      return error ? { error: error.message } : {};
    },
  };
}
