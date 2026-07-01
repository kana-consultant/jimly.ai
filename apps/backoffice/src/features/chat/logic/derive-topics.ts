import type { ChatSession } from '@/types/chat';

const INTENT_TOPICS: Record<string, string[]> = {
  research: ['Competitors', 'Market trends', 'Industry reports'],
  brainstorm: ['Alternatives', 'Creative ideas', 'New approaches'],
  summarize: ['Key points', 'Outline', 'Extract insights'],
  code: ['Debug this', 'Refactor', 'Write tests'],
  write: ['Draft reply', 'Rewrite', 'Expand this'],
  explain: ['Simplify', 'Examples', 'Step-by-step'],
  compare: ['Pros and cons', 'Alternatives', 'Trade-offs'],
  analyze: ['Key insights', 'Root causes', 'Implications'],
};

export const DEFAULT_TOPICS = ['Research', 'Brainstorm', 'Summarize', 'Check facts'];

function truncateWords(text: string, maxWords = 2): string {
  const words = text.trim().split(/\s+/);
  return words.length <= maxWords ? text.trim() : words.slice(0, maxWords).join(' ');
}

export function deriveTopics(
  messages: { role: string; content: string }[],
  sessions: Pick<ChatSession, 'title' | 'updatedAt'>[],
): string[] {
  if (!messages.length) {
    const recentTitles = sessions
      .slice()
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 4)
      .map((s) => truncateWords(s.title));
    return recentTitles.length ? recentTitles : DEFAULT_TOPICS;
  }

  const userMessages = messages.filter((m) => m.role === 'user');
  if (!userMessages.length) return DEFAULT_TOPICS;

  const lastUserContent = userMessages[userMessages.length - 1]!.content.toLowerCase();
  for (const [intent, topics] of Object.entries(INTENT_TOPICS)) {
    if (lastUserContent.includes(intent)) return topics;
  }

  if (lastUserContent.includes('?')) {
    return ['Tell more', 'Simplify', 'Examples', 'Step-by-step'];
  }

  return ['Explore more', 'Details', 'Examples', 'Alternatives'];
}
