import { Store, useStore } from '@tanstack/react-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginUser } from '@/lib/auth-api-client';
import { useAuthStore } from '@/stores/auth-store';
import { PasswordInput } from '@/features/auth/password-input';

const loginFormStore = new Store({ email: '', password: '', error: null as string | null, isSubmitting: false });

export function LoginForm() {
  const email = useStore(loginFormStore, (s) => s.email);
  const password = useStore(loginFormStore, (s) => s.password);
  const error = useStore(loginFormStore, (s) => s.error);
  const isSubmitting = useStore(loginFormStore, (s) => s.isSubmitting);
  const setUser = useAuthStore((state) => state.setUser);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    loginFormStore.setState((s) => ({ ...s, error: null, isSubmitting: true }));
    const result = await loginUser({ email, password });
    if ('error' in result) {
      loginFormStore.setState((s) => ({ ...s, error: result.error, isSubmitting: false }));
      return;
    }
    setUser(result.user);
    window.location.href = '/chat';
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => loginFormStore.setState((s) => ({ ...s, email: e.target.value }))}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <PasswordInput
          id="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => loginFormStore.setState((s) => ({ ...s, password: e.target.value }))}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Logging in...' : 'Log in'}
      </Button>
    </form>
  );
}
