import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginUser } from '@/lib/auth-api-client';
import { useAuthStore } from '@/stores/auth-store';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((state) => state.setUser);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await loginUser({ email, password });
    if ('error' in result) {
      setError(result.error);
      return;
    }
    setUser(result.user);
    window.location.href = '/chat';
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit">Log in</Button>
    </form>
  );
}
