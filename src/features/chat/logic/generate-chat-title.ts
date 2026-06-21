const MAX_LENGTH = 40;

export function generateChatTitle(firstMessage: string): string {
  const normalized = firstMessage.trim().replace(/\s+/g, ' ');
  if (!normalized) return 'New chat';
  return normalized.length > MAX_LENGTH ? `${normalized.slice(0, MAX_LENGTH)}…` : normalized;
}
