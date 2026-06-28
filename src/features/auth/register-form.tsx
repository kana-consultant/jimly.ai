import { Store, useStore } from '@tanstack/react-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { registerUser } from '@/lib/auth-api-client';
import { useAuthStore } from '@/stores/auth-store';
import { PasswordInput } from '@/features/auth/password-input';

const registerFormStore = new Store({ name: '', email: '', password: '', error: null as string | null, isSubmitting: false });

export function RegisterForm() {
  const name = useStore(registerFormStore, (s) => s.name);
  const email = useStore(registerFormStore, (s) => s.email);
  const password = useStore(registerFormStore, (s) => s.password);
  const error = useStore(registerFormStore, (s) => s.error);
  const isSubmitting = useStore(registerFormStore, (s) => s.isSubmitting);
  const setUser = useAuthStore((state) => state.setUser);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    registerFormStore.setState((s) => ({ ...s, error: null, isSubmitting: true }));
    const result = await registerUser({ email, password, name });
    if ('error' in result) {
      registerFormStore.setState((s) => ({ ...s, error: result.error, isSubmitting: false }));
      return;
    }
    setUser(result.user);
    window.location.href = '/chat';
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Name
        </label>
        <Input
          id="name"
          type="text"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => registerFormStore.setState((s) => ({ ...s, name: e.target.value }))}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => registerFormStore.setState((s) => ({ ...s, email: e.target.value }))}
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
          onChange={(e) => registerFormStore.setState((s) => ({ ...s, password: e.target.value }))}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Creating account...' : 'Sign up'}
      </Button>
    </form>
  );
}
