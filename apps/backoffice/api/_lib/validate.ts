import type { ChatMessage, ChatRole, NewChatSession } from '@/types/chat';

const CHAT_ROLES: readonly ChatRole[] = ['user', 'assistant', 'system'];
const MAX_CONTENT_LENGTH = 8000;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Validates the body of a POST /api/sessions request.
 * Whitelists exactly the fields of NewChatSession — any other field
 * (e.g. a forged `userId`) is dropped, never forwarded to the repository.
 */
export function validateNewSession(body: unknown): NewChatSession | null {
  if (!isRecord(body)) return null;
  const { id, title, pinned, createdAt, updatedAt } = body;
  if (!isNonEmptyString(id)) return null;
  if (!isNonEmptyString(title)) return null;
  if (typeof pinned !== 'boolean') return null;
  if (!isNonEmptyString(createdAt)) return null;
  if (!isNonEmptyString(updatedAt)) return null;
  return { id, title, pinned, createdAt, updatedAt };
}

/**
 * Validates the body of a PATCH /api/sessions/:id request.
 * Picks only the patchable fields if present and type-correct; drops everything else.
 */
export function validateSessionPatch(
  body: unknown,
): { updatedAt?: string; pinned?: boolean; title?: string } | null {
  if (!isRecord(body)) return null;
  const patch: { updatedAt?: string; pinned?: boolean; title?: string } = {};

  if ('updatedAt' in body) {
    if (!isNonEmptyString(body.updatedAt)) return null;
    patch.updatedAt = body.updatedAt;
  }
  if ('pinned' in body) {
    if (typeof body.pinned !== 'boolean') return null;
    patch.pinned = body.pinned;
  }
  if ('title' in body) {
    if (!isNonEmptyString(body.title)) return null;
    patch.title = body.title;
  }

  return patch;
}

/**
 * Validates the body of a POST /api/sessions/:id/messages request.
 * Whitelists exactly the fields of ChatMessage — any other field
 * (e.g. a forged `userId`) is dropped, never forwarded to the repository.
 */
export function validateMessage(body: unknown): ChatMessage | null {
  if (!isRecord(body)) return null;
  const { id, sessionId, role, content, createdAt } = body;
  if (!isNonEmptyString(id)) return null;
  if (!isNonEmptyString(sessionId)) return null;
  if (typeof role !== 'string' || !CHAT_ROLES.includes(role as ChatRole)) return null;
  if (typeof content !== 'string' || content.length === 0 || content.length > MAX_CONTENT_LENGTH) return null;
  if (!isNonEmptyString(createdAt)) return null;
  return { id, sessionId, role: role as ChatRole, content, createdAt };
}
