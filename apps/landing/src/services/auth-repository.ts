import type { User, AuthCredentials } from '@/types/auth';

export interface AuthRepository {
  register(credentials: AuthCredentials): Promise<{ user: User } | { error: string }>;
  login(credentials: AuthCredentials): Promise<{ user: User } | { error: string }>;
  logout(): Promise<{ error?: string }>;
}
