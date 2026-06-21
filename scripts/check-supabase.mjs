import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const { error, count } = await supabase
  .from('chat_sessions')
  .select('*', { count: 'exact', head: true });

if (error) {
  console.error('FAIL:', error.message);
  process.exit(1);
}
console.log('OK: chat_sessions reachable, rows =', count);
