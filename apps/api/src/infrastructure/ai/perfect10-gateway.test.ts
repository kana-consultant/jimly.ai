import { describe, it, expect, vi } from 'vitest';
import { makeInactivitySignal } from './perfect10-gateway';

describe('makeInactivitySignal', () => {
  it('aborts after idle ms with no reset', () => {
    vi.useFakeTimers();
    const { signal, clear } = makeInactivitySignal(100);
    vi.advanceTimersByTime(101);
    expect(signal.aborted).toBe(true);
    clear();
    vi.useRealTimers();
  });

  it('does not abort when reset before deadline', () => {
    vi.useFakeTimers();
    const { signal, reset, clear } = makeInactivitySignal(100);
    vi.advanceTimersByTime(80);
    reset();
    vi.advanceTimersByTime(80); // only 80ms since last reset
    expect(signal.aborted).toBe(false);
    clear();
    vi.useRealTimers();
  });

  it('aborts after reset + another full idle period', () => {
    vi.useFakeTimers();
    const { signal, reset, clear } = makeInactivitySignal(100);
    vi.advanceTimersByTime(80);
    reset();
    vi.advanceTimersByTime(101); // now exceeds deadline from last reset
    expect(signal.aborted).toBe(true);
    clear();
    vi.useRealTimers();
  });
});
