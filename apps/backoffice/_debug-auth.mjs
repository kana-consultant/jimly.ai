import { auth } from './src/auth/server.ts';

const req = new Request('http://localhost:3000/api/auth/sign-up/email', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com', password: 'password123', name: 'Test' }),
});

try {
  const res = await auth.handler(req);
  console.log('STATUS', res.status);
  console.log(await res.text());
} catch (err) {
  console.error('CRASH:', err);
}
