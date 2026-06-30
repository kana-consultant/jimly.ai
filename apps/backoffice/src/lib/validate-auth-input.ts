export interface ValidationResult {
  ok: boolean;
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): ValidationResult {
  if (!email) return { ok: false, error: 'Email is required' };
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Email is invalid' };
  return { ok: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) return { ok: false, error: 'Password is required' };
  if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters' };
  return { ok: true };
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`assert failed: ${msg}`);
}

function __main__() {
  assert(validateEmail('a@b.com').ok === true, 'valid email passes');
  assert(validateEmail('').ok === false, 'empty email fails');
  assert(validateEmail('not-an-email').ok === false, 'malformed email fails');
  assert(validatePassword('longenough1').ok === true, 'valid password passes');
  assert(validatePassword('short').ok === false, 'short password fails');
  assert(validatePassword('').ok === false, 'empty password fails');
  console.log('validate-auth-input: all checks passed');
}

declare const process: { argv: string[] } | undefined;

if (
  import.meta.url.endsWith('validate-auth-input.ts') &&
  typeof process !== 'undefined' &&
  process.argv[1]?.endsWith('validate-auth-input.ts')
) {
  __main__();
}
