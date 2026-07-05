import type { ChatSession } from '@/routes/chat/types';

interface TopicEntry {
  patterns: string[];
  continuations: string[];
}

// Each entry maps keyword patterns → 4 likely next-question suggestions for that topic.
// Patterns are checked against lowercased text; first match wins.
// Entries are bilingual (Indonesian + English) — Indonesian civic/law topics come first
// since that is the primary domain of this app.
const TOPIC_MAP: TopicEntry[] = [
  // ── Indonesian civic & law topics ────────────────────────────────────────
  {
    patterns: ['demokrasi', 'demokratis', 'democracy', 'pemilihan umum', 'pemilu', 'voting', 'suara rakyat'],
    continuations: ['Sistem Pemilihan Umum', 'Hak Pilih Warga Negara', 'Partai Politik', 'Pemisahan Kekuasaan'],
  },
  {
    patterns: ['hak asasi manusia', 'hak asasi', 'pelanggaran ham', 'hak sipil', 'human rights', 'kebebasan berpendapat', 'ham'],
    continuations: ['Mekanisme Penegakan HAM', 'Hak Sipil dan Politik', 'HAM dalam Konstitusi', 'Lembaga HAM Nasional'],
  },
  {
    patterns: ['rekonsiliasi', 'reconciliation', 'amnesti', 'amnesty', 'komisi kebenaran', 'truth commission', 'pemulihan korban'],
    continuations: ['Mekanisme Amnesti', 'Pemulihan Korban', 'Pertanggungjawaban Pelaku', 'Komisi Kebenaran'],
  },
  {
    patterns: ['tata negara', 'konstitusi', 'constitution', 'uud 1945', 'undang-undang dasar', 'mahkamah konstitusi', 'amandemen'],
    continuations: ['Amendemen Konstitusi', 'Lembaga Negara', 'Hak Warga Negara', 'Mahkamah Konstitusi'],
  },
  {
    patterns: ['hukum pidana', 'hukum perdata', 'yurisprudensi', 'peradilan', 'pengadilan', 'jaksa', 'hakim', 'vonis'],
    continuations: ['Hukum Pidana vs Perdata', 'Sistem Peradilan', 'Proses Persidangan', 'Yurisprudensi'],
  },
  {
    patterns: ['hukum', 'peraturan', 'undang-undang', 'perundang-undangan', 'regulasi', 'law', 'legal', 'legislation'],
    continuations: ['Hierarki Peraturan', 'Penegakan Hukum', 'Pembentukan Undang-Undang', 'Sanksi Hukum'],
  },
  {
    patterns: ['pancasila', 'ideologi negara', 'bhineka tunggal ika', 'gotong royong', 'persatuan indonesia'],
    continuations: ['Implementasi Pancasila', 'Nilai-Nilai Kebangsaan', 'Toleransi Beragama', 'Gotong Royong'],
  },
  {
    patterns: ['pemerintah', 'pemerintahan', 'kebijakan publik', 'public policy', 'legislatif', 'eksekutif', 'yudikatif', 'desentralisasi'],
    continuations: ['Sistem Pemerintahan', 'Kebijakan Publik', 'Akuntabilitas Pemerintah', 'Otonomi Daerah'],
  },
  {
    patterns: ['korupsi', 'corruption', 'kpk', 'suap', 'gratifikasi', 'pencucian uang', 'money laundering'],
    continuations: ['Pemberantasan Korupsi', 'Peran KPK', 'Gratifikasi dan Suap', 'Whistleblower Protection'],
  },
  {
    patterns: ['kewarganegaraan', 'citizenship', 'hak warga negara', 'kewajiban warga', 'naturalisasi'],
    continuations: ['Hak dan Kewajiban WNI', 'Proses Naturalisasi', 'Kehilangan Kewarganegaraan', 'Dwi Kewarganegaraan'],
  },
  {
    patterns: ['ham internasional', 'hukum internasional', 'international law', 'pbb', 'united nations', 'konvensi internasional', 'mahkamah internasional'],
    continuations: ['Konvensi HAM Internasional', 'Peran PBB', 'Mahkamah Internasional', 'Ratifikasi Perjanjian'],
  },

  // ── Tech topics (English) ─────────────────────────────────────────────────
  {
    patterns: ['jwt', 'refresh token', 'access token', 'logout', 'login', 'oauth', 'credential', 'password', 'session', 'auth'],
    continuations: ['Role-Based Authorization', 'JWT Security Best Practices', 'Access Token Expiration', 'Secure Logout Flow'],
  },
  {
    patterns: ['prompt engineering', 'prompt', 'llm', 'ai agent', 'claude', 'gpt', 'model', 'inference', 'embedding', 'rag', 'retrieval'],
    continuations: ['Context Window', 'Memory Management', 'RAG Integration', 'Prompt Optimization'],
  },
  {
    patterns: ['react', 'component', 'usestate', 'useeffect', 'hook', 'jsx', 'tsx', 'vite', 'next.js', 'nextjs'],
    continuations: ['Custom Hooks', 'Performance Optimization', 'State Management', 'Component Testing'],
  },
  {
    patterns: ['rest api', 'endpoint', 'http request', 'fetch', 'axios', 'api route', 'graphql', 'trpc'],
    continuations: ['Error Handling', 'Rate Limiting', 'API Authentication', 'Response Caching'],
  },
  {
    patterns: ['database', 'sql', 'query', 'schema', 'migration', 'postgres', 'mysql', 'prisma', 'drizzle', 'orm'],
    continuations: ['Database Indexing', 'Query Optimization', 'Schema Design', 'Data Migrations'],
  },
  {
    patterns: ['typescript', 'interface', 'generic', 'enum', 'union', 'zod', 'type-safe'],
    continuations: ['Generic Types', 'Type Guards', 'Schema Validation', 'Utility Types'],
  },
  {
    patterns: ['unit test', 'integration test', 'e2e', 'vitest', 'jest', 'playwright', 'mock'],
    continuations: ['Test Coverage', 'Mocking Strategies', 'E2E Testing', 'Test-Driven Development'],
  },
  {
    patterns: ['deploy', 'docker', 'ci/cd', 'kubernetes', 'aws', 'vercel', 'nginx', 'pipeline', 'container'],
    continuations: ['CI/CD Setup', 'Container Orchestration', 'Environment Variables', 'Zero-Downtime Deploy'],
  },
  {
    patterns: ['performance', 'cache', 'optimize', 'memory leak', 'latency', 'bundle size', 'lazy load'],
    continuations: ['Caching Strategy', 'Code Splitting', 'Lazy Loading', 'Performance Profiling'],
  },
  {
    patterns: ['security', 'vulnerability', 'xss', 'csrf', 'injection', 'sanitize', 'encrypt', 'hash'],
    continuations: ['Input Validation', 'CORS Configuration', 'Secret Management', 'Security Headers'],
  },
  {
    patterns: ['git', 'branch', 'merge', 'rebase', 'pull request', 'conflict', 'commit'],
    continuations: ['Branching Strategy', 'Code Review Process', 'Merge Conflicts', 'Git Workflows'],
  },
  {
    patterns: ['debug', 'error', 'bug', 'exception', 'crash', 'stack trace'],
    continuations: ['Root Cause Analysis', 'Error Handling', 'Logging Strategy', 'Reproduce the Bug'],
  },
  {
    patterns: ['design', 'ui', 'ux', 'layout', 'typography', 'accessibility', 'tailwind'],
    continuations: ['Responsive Design', 'Accessibility Standards', 'Design System', 'User Testing'],
  },
  {
    patterns: ['algorithm', 'data structure', 'complexity', 'sorting', 'graph', 'tree', 'hash map'],
    continuations: ['Time Complexity', 'Space Optimization', 'Edge Cases', 'Real-World Application'],
  },
  {
    patterns: ['microservice', 'monolith', 'architecture', 'event', 'queue', 'message broker'],
    continuations: ['Service Communication', 'Data Consistency', 'Fault Tolerance', 'Observability'],
  },
];

export const DEFAULT_TOPICS = ['Jelaskan', 'Bandingkan', 'Ringkaskan', 'Berikan Contoh'];

// Shared: find continuations by scanning text against topic patterns.
// Returns null when no topic is detected so callers can apply fallbacks.
// Short patterns (≤4 chars) use word-boundary regex to avoid false positives
// e.g. "ham" should not match inside "muhammad" or "graham".
function detectContinuations(text: string): string[] | null {
  const lower = text.toLowerCase();
  for (const entry of TOPIC_MAP) {
    const matched = entry.patterns.some((p) => {
      if (p.length <= 4) return new RegExp(`\\b${p}\\b`).test(lower);
      return lower.includes(p);
    });
    if (matched) return entry.continuations;
  }
  return null;
}

// Empty state: no active conversation. Use the most recent session title to
// infer what the user is likely to continue exploring next.
export function deriveEmptyStateSuggestions(
  sessions: Pick<ChatSession, 'title' | 'updatedAt'>[],
): string[] {
  if (!sessions.length) return DEFAULT_TOPICS;

  const latest = sessions
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]!;

  return detectContinuations(latest.title) ?? DEFAULT_TOPICS;
}

// Active conversation: scan the last 3 user messages for topic, then return
// suggestions the user has not already asked about.
export function deriveActiveConversationSuggestions(
  messages: { role: string; content: string }[],
): string[] {
  const userMessages = messages.filter((m) => m.role === 'user');
  if (!userMessages.length) return DEFAULT_TOPICS;

  const recentContent = userMessages
    .slice(-3)
    .map((m) => m.content)
    .join(' ');

  const continuations = detectContinuations(recentContent);
  if (!continuations) return ['Jelaskan Lebih Lanjut', 'Konsep Terkait', 'Contoh Praktis', 'Pertanyaan Lanjutan'];

  // Remove suggestions whose first word matches something the user already asked.
  const askedLower = userMessages.map((m) => m.content.toLowerCase()).join(' ');
  const filtered = continuations.filter((c) => {
    const firstWord = c.toLowerCase().split(' ')[0]!;
    return !askedLower.includes(firstWord);
  });

  // Fall back to unfiltered list rather than returning fewer than 2.
  return filtered.length >= 2 ? filtered : continuations;
}
