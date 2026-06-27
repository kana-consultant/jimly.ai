import { auth } from '#/infrastructure/auth/better-auth';

export const config = { runtime: 'edge' };

export default function handler(req: Request) {
  return auth.handler(req);
}
