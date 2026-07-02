type NamedUser = { name?: string | null; email?: string | null } | null | undefined;

function fromEmail(email: string): string {
  const local = email.slice(0, email.indexOf('@'));
  return local
    .split(/[._-]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

// Better Auth falls back to the raw email as `name` when no real name is
// provided (Google sign-in without a profile name, etc). Treat that as "no name".
export function getDisplayName(user: NamedUser, fallback = ''): string {
  if (user?.name && user.name !== user.email) return user.name;
  if (user?.email) return fromEmail(user.email);
  return fallback;
}
