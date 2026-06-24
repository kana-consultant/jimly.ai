import { auth } from '@/auth/server';

export const config = { runtime: 'edge' };

export default function handler(req: Request) {
  return auth.handler(req);
}
