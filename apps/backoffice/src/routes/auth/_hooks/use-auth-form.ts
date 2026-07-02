import { useState } from 'react';

export function useAuthForm(
  submit: () => Promise<{ error: string } | object>,
  redirectTo: string,
) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await submit();
    if ('error' in result) {
      setError((result as { error: string }).error);
      setIsSubmitting(false);
      return;
    }
    window.location.href = redirectTo;
  }

  return { error, isSubmitting, handleSubmit };
}
