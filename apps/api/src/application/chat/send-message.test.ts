import { describe, it, expect, vi } from 'vitest';
import { makeSendMessage } from './send-message';
import type { ChatRepository } from '#/domain/chat/chat-repository';
import type { AiGateway } from '#/domain/ports/ai-gateway';
import type { AuthedContext } from '../shared/context';

const ctx: AuthedContext = { userId: 'u1', origin: 'https://api.test', headers: new Headers() };

function sseStream(...chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

async function drain(stream: ReadableStream<Uint8Array>): Promise<void> {
  const reader = stream.getReader();
  while (!(await reader.read()).done) {
    // consume
  }
}

function makeRepo(overrides: Partial<ChatRepository> = {}): ChatRepository {
  return {
    listSessions: vi.fn(),
    createSession: vi.fn(),
    updateSession: vi.fn(),
    deleteSession: vi.fn(),
    listMessages: vi.fn(),
    addMessage: vi.fn().mockResolvedValue(undefined),
    getPerfect10SessionId: vi.fn().mockResolvedValue('pid-1'),
    setPerfect10SessionId: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeGateway(overrides: Partial<AiGateway> = {}): AiGateway {
  return {
    createSession: vi.fn().mockResolvedValue('pid-1'),
    sendMessage: vi.fn().mockResolvedValue(42),
    streamReply: vi.fn().mockResolvedValue(
      sseStream(
        'data: {"choices":[{"delta":{"content":"Hel"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":"lo"}}]}\n\n',
        'data: [DONE]\n\n',
      ),
    ),
    ...overrides,
  };
}

describe('makeSendMessage', () => {
  it('persists the user message before talking to the gateway', async () => {
    const repo = makeRepo();
    const gateway = makeGateway();
    const sendMessage = makeSendMessage(repo, gateway);

    await sendMessage({ chatId: 'c1', content: 'hi' }, ctx);

    expect(repo.addMessage).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: 'c1', role: 'user', content: 'hi' }),
    );
    const userCallOrder = (repo.addMessage as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0]!;
    const sendOrder = (gateway.sendMessage as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0]!;
    expect(userCallOrder).toBeLessThan(sendOrder);
  });

  it('persists the full assistant reply only after the stream completes', async () => {
    const repo = makeRepo();
    const gateway = makeGateway();
    const sendMessage = makeSendMessage(repo, gateway);

    const stream = await sendMessage({ chatId: 'c1', content: 'hi' }, ctx);
    expect(repo.addMessage).toHaveBeenCalledTimes(1); // only the user message so far

    await drain(stream);

    expect(repo.addMessage).toHaveBeenCalledTimes(2);
    expect(repo.addMessage).toHaveBeenLastCalledWith(
      expect.objectContaining({ sessionId: 'c1', role: 'assistant', content: 'Hello' }),
    );
  });

  it('creates a perfect10 session when none exists yet', async () => {
    const repo = makeRepo({ getPerfect10SessionId: vi.fn().mockResolvedValue(null) });
    const gateway = makeGateway();
    const sendMessage = makeSendMessage(repo, gateway);

    await sendMessage({ chatId: 'c1', content: 'hi' }, ctx);

    expect(gateway.createSession).toHaveBeenCalledWith(ctx.origin);
    expect(repo.setPerfect10SessionId).toHaveBeenCalledWith('c1', 'pid-1');
  });

  it('throws bad_gateway when the upstream send fails, without persisting an assistant message', async () => {
    const repo = makeRepo();
    const gateway = makeGateway({ sendMessage: vi.fn().mockRejectedValue(new Error('upstream down')) });
    const sendMessage = makeSendMessage(repo, gateway);

    await expect(sendMessage({ chatId: 'c1', content: 'hi' }, ctx)).rejects.toMatchObject({ code: 'bad_gateway' });
    expect(repo.addMessage).toHaveBeenCalledTimes(1); // user message only
  });
});
