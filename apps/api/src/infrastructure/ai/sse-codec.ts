const _encoder = new TextEncoder();

export function parseDeltaContent(data: string): string | null {
  try {
    const parsed = JSON.parse(data) as { choices?: { delta?: { content?: string } }[] };
    return parsed.choices?.[0]?.delta?.content ?? null;
  } catch {
    return null;
  }
}

export function sseDataLine(json: string): Uint8Array {
  return _encoder.encode(`data: ${json}\n\n`);
}

export function sseDoneLine(): Uint8Array {
  return _encoder.encode('data: [DONE]\n\n');
}

// Pure line splitter — caller owns the TextDecoder (stateful for multi-byte chars)
export function splitSseLines(buffer: string, decoded: string): { lines: string[]; remainder: string } {
  const combined = buffer + decoded;
  const parts = combined.split('\n');
  return { lines: parts.slice(0, -1), remainder: parts[parts.length - 1] ?? '' };
}
