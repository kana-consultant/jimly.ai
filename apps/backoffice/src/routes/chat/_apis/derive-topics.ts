import type { ChatSession } from '@/routes/chat/types';

interface TopicEntry {
  patterns: string[];
  continuations: string[];
}

const TOPIC_MAP: TopicEntry[] = [
  // ── Hukum Tata Negara sebagai Disiplin Ilmu ───────────────────────────────
  {
    patterns: ['hukum tata negara', 'ilmu hukum tata negara', 'disiplin ilmu hukum', 'htn formil', 'htn materiel'],
    continuations: ['Definisi Hukum Tata Negara', 'HTN vs Hukum Administrasi Negara', 'HTN vs Ilmu Negara', 'Ruang Lingkup Praktik HTN'],
  },
  {
    patterns: ['konstitusi', 'uud 1945', 'undang-undang dasar', 'amandemen', 'amendemen', 'constitution', 'konstitusionalisme'],
    continuations: ['Sejarah dan Asal-Usul Konstitusi', 'Sifat Konstitusi Rigid vs Flexible', 'Konstitusi Tertulis vs Tidak Tertulis', 'Perubahan UUD 1945'],
  },
  {
    patterns: ['sumber hukum', 'konvensi ketatanegaraan', 'perundang-undangan', 'hierarki norma', 'norma dasar', 'traktat'],
    continuations: ['Sumber Hukum Tata Negara Indonesia', 'Konvensi Ketatanegaraan', 'Hierarki Peraturan Perundang-undangan', 'Perjanjian Internasional sebagai Sumber HTN'],
  },
  {
    patterns: ['penafsiran', 'tafsir', 'interpretasi konstitusi', 'hermeneutika'],
    continuations: ['Metode Penafsiran dalam HTN', 'Hermeneutika Hukum', 'Anatomi Tafsir Konstitusi', 'Ragam Pendekatan Interpretasi'],
  },
  // ── Organ dan Kekuasaan Negara ────────────────────────────────────────────
  {
    patterns: ['pemisahan kekuasaan', 'pembagian kekuasaan', 'lembaga negara', 'trias politica', 'desentralisasi', 'dekonsentrasi'],
    continuations: ['Pembatasan Kekuasaan Negara', 'Pemisahan vs Pembagian Kekuasaan', 'Desentralisasi dan Dekonsentrasi', 'Organisasi Negara di Era Globalisasi'],
  },
  {
    patterns: ['legislatif', 'dpr', 'dpd', 'mpr', 'parlemen', 'bikameral', 'dua kamar', 'fungsi legislasi'],
    continuations: ['Fungsi Kekuasaan Legislatif', 'Bikameralisme di Indonesia', 'Fungsi Pengawasan Parlemen', 'Fungsi Representasi'],
  },
  {
    patterns: ['eksekutif', 'presiden', 'menteri', 'kabinet', 'kewenangan menteri'],
    continuations: ['Sistem Kekuasaan Eksekutif', 'Kewenangan Menteri untuk Mengatur', 'Struktur Kementerian Negara', 'Pergeseran Kekuasaan Eksekutif'],
  },
  {
    patterns: ['yudikatif', 'mahkamah konstitusi', 'mahkamah agung', 'kekuasaan kehakiman', 'pengujian undang-undang', 'judicial review'],
    continuations: ['Kekuasaan Kehakiman', 'Mahkamah Konstitusi dan Pengujian UU', 'Independensi Peradilan', 'Sengketa Kewenangan Lembaga Negara'],
  },
  // ── Sistem Pemerintahan ───────────────────────────────────────────────────
  {
    patterns: ['presidensialisme', 'parlementarisme', 'sistem pemerintahan', 'presidential', 'parliamentary'],
    continuations: ['Presidensialisme vs Parlementarisme', 'Sistem Presidensial Indonesia', 'Perbandingan Sistem Pemerintahan', 'Pilihan Desain Ketatanegaraan'],
  },
  // ── Demokrasi ─────────────────────────────────────────────────────────────
  {
    patterns: ['demokrasi', 'nomokrasi', 'democratic', 'kedaulatan rakyat', 'supremasi hukum'],
    continuations: ['Demokrasi dan Nomokrasi', 'Kedaulatan Rakyat', 'Supremasi Hukum', 'Syarat Menuju Indonesia Baru'],
  },
  {
    patterns: ['pemilihan umum', 'pemilu', 'sistem pemilu', 'proporsional', 'distrik', 'sengketa pemilu', 'penyelenggara pemilu'],
    continuations: ['Tujuan Penyelenggaraan Pemilu', 'Sistem Pemilu Proporsional vs Distrik', 'Sengketa Hasil Pemilu', 'Penyelenggara Pemilu'],
  },
  {
    patterns: ['partai politik', 'parpol', 'pelembagaan demokrasi', 'fungsi partai'],
    continuations: ['Fungsi Partai Politik', 'Kelemahan Partai Politik', 'Partai dan Pemilu', 'Pelembagaan Demokrasi'],
  },
  // ── HAM dan Kewarganegaraan ───────────────────────────────────────────────
  {
    patterns: ['hak asasi manusia', 'hak asasi', 'human rights', 'kebebasan', 'hak sipil', 'kewajiban asasi', 'ham'],
    continuations: ['HAM dalam UUD 1945', 'Kewajiban Asasi Manusia', 'Dimensi Konseptual HAM', 'Pemajuan HAM Dewasa Ini'],
  },
  {
    patterns: ['kewarganegaraan', 'warga negara', 'naturalisasi', 'citizenship', 'dwi kewarganegaraan'],
    continuations: ['Warga Negara vs Penduduk', 'Prinsip Dasar Kewarganegaraan', 'Perolehan dan Kehilangan Kewarganegaraan', 'Dwi Kewarganegaraan'],
  },
  // ── Topik Khusus ──────────────────────────────────────────────────────────
  {
    patterns: ['rekonsiliasi', 'amnesti', 'komisi kebenaran', 'pemulihan korban', 'reconciliation'],
    continuations: ['Rekonsiliasi Nasional', 'Mekanisme Amnesti', 'Komisi Kebenaran', 'Pemulihan Korban'],
  },
  {
    patterns: ['konstitusi ekonomi', 'konstitusi politik', 'sistem ekonomi', 'ekonomi konstitusi'],
    continuations: ['Konstitusi Politik vs Konstitusi Ekonomi', 'Sistem Ekonomi dalam UUD', 'Dimensi Ekonomi HTN', 'Kajian Konstitusi Ekonomi'],
  },
  {
    patterns: ['pancasila', 'ideologi negara', 'dasar negara', 'bhineka tunggal ika', 'gotong royong'],
    continuations: ['Pancasila sebagai Dasar Negara', 'Nilai-Nilai Kebangsaan', 'Ideologi Negara', 'Implementasi Pancasila'],
  },
];

export const DEFAULT_TOPICS = [
  'Apa itu Hukum Tata Negara?',
  'Bagaimana kekuasaan negara dibatasi?',
  'Apa fungsi partai politik dalam demokrasi?',
  'Apa itu demokrasi dan nomokrasi?',
];

const COMPILED_MAP = TOPIC_MAP.map((entry) => ({
  matchers: entry.patterns.map((p): RegExp | string =>
    p.length <= 4 ? new RegExp(`\\b${p}\\b`) : p,
  ),
  continuations: entry.continuations,
}));

function detectContinuations(text: string): string[] | null {
  const lower = text.toLowerCase();
  for (const entry of COMPILED_MAP) {
    const matched = entry.matchers.some((m) =>
      typeof m === 'string' ? lower.includes(m) : m.test(lower),
    );
    if (matched) return entry.continuations;
  }
  return null;
}

export function deriveEmptyStateSuggestions(
  sessions: Pick<ChatSession, 'title' | 'updatedAt'>[],
): string[] {
  if (!sessions.length) return DEFAULT_TOPICS;

  const latest = sessions
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]!;

  return detectContinuations(latest.title) ?? DEFAULT_TOPICS;
}

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
