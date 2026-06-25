import { auth } from '../../src/auth/server';

export default function handler(req: Request) {
  return auth.handler(req);
}
