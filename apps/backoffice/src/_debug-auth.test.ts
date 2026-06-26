import { describe, it } from 'vitest';

describe('debug auth crash', () => {
  it('calls sign-up handler and prints the real error', async () => {
    const { auth } = await import('./auth/server');
    const req = new Request('http://localhost:3000/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'debug-test@example.com', password: 'password123', name: 'Debug Test' }),
    });
    try {
      const res = await auth.handler(req);
      console.log('STATUS', res.status);
      console.log('BODY', await res.text());
    } catch (err) {
      console.error('CRASH', err);
    }
  });
});
