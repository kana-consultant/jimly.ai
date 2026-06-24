import { describe, it, expect } from 'vitest';
import { createNeonChatRepository } from './neon-chat-repository';
import { db } from '../db/client';

describe('NeonChatRepository', () => {
  it('creates then lists a session for a user', async () => {
    const repo = createNeonChatRepository(db, 'test-user-1');
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await repo.createSession({ id, title: 'Hello', pinned: false, createdAt: now, updatedAt: now });
    const sessions = await repo.listSessions();
    expect(sessions.some((s) => s.id === id)).toBe(true);
    await repo.deleteSession(id);
  });

  it("does not leak or accept writes to another user's session (IDOR guard)", async () => {
    const a = createNeonChatRepository(db, 'user-a');
    const b = createNeonChatRepository(db, 'user-b');
    const sid = crypto.randomUUID();
    const now = new Date().toISOString();
    await a.createSession({ id: sid, title: 'A', pinned: false, createdAt: now, updatedAt: now });
    await a.addMessage({ id: crypto.randomUUID(), sessionId: sid, role: 'user', content: 'secret', createdAt: now });
    expect(await b.listMessages(sid)).toEqual([]); // b cannot read a's messages
    await expect(
      b.addMessage({ id: crypto.randomUUID(), sessionId: sid, role: 'user', content: 'x', createdAt: now }),
    ).rejects.toThrow(); // b cannot write into a's session
    await a.deleteSession(sid);
  });
});
