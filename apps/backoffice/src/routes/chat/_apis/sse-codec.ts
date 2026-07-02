export function parseDeltaContent(data: string): string | null {
  try {
    const parsed = JSON.parse(data) as { choices?: { delta?: { content?: string } }[] };
    return parsed.choices?.[0]?.delta?.content ?? null;
  } catch {
    return null;
  }
}
