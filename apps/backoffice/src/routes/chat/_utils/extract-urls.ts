export function extractUrls(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s\)\]"'<>]+/g) ?? [];
  return [...new Set(matches)];
}
