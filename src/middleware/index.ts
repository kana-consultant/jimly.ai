import { sequence, defineMiddleware } from 'astro:middleware';
import { requireAuth } from '@/middleware/require-auth';

const PROTECTED_PREFIXES = ['/chat'];

const guardProtectedRoutes = defineMiddleware(async (context, next) => {
  const isProtected = PROTECTED_PREFIXES.some((prefix) => context.url.pathname.startsWith(prefix));
  if (!isProtected) return next();

  const redirect = await requireAuth(context);
  return redirect ?? next();
});

export const onRequest = sequence(guardProtectedRoutes);
