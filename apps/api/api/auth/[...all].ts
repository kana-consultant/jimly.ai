import { auth } from '../../src/auth/server';

export const config = { runtime: 'edge' };

export default function handler(req: Request) {
  return auth.handler(req);
}
