import { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/form/password-input';
import { useAuthForm } from '@/routes/auth/_hooks/use-auth-form';
import { loginUser, registerUser } from '@/libs/auth-api-client';

type Mode = 'login' | 'register';

const EASE = [0.4, 0, 0.2, 1] as [number, number, number, number];

const fieldAnim = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.25, ease: EASE },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const uid = useId();
  const isRegister = mode === 'register';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!isRegister) setName('');
  }, [isRegister]);

  const { error, isSubmitting, handleSubmit } = useAuthForm(
    () =>
      isRegister
        ? registerUser({ email, password, name })
        : loginUser({ email, password }),
    '/chat',
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Name — register only, expands/collapses */}
      <AnimatePresence initial={false}>
        {isRegister && (
          <motion.div key="name" {...fieldAnim} style={{ overflow: 'hidden' }}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${uid}-name`} className="text-sm font-medium text-foreground">
                Name
              </label>
              <Input
                id={`${uid}-name`}
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isRegister}
                autoComplete="name"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email — always mounted */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${uid}-email`} className="text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id={`${uid}-email`}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      {/* Password — always mounted */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${uid}-password`} className="text-sm font-medium text-foreground">
          Password
        </label>
        <PasswordInput
          id={`${uid}-password`}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={isRegister ? 'new-password' : 'current-password'}
        />
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive"
        >
          {error}
        </motion.p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full mt-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={`${mode}-${isSubmitting}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {isSubmitting
              ? isRegister ? 'Creating account…' : 'Logging in…'
              : isRegister ? 'Sign up' : 'Log in'}
          </motion.span>
        </AnimatePresence>
      </Button>
    </form>
  );
}
