// Port: per-key rate limiting. Returns data (not an HTTP Response); presentation maps it.
export interface RateLimiter {
  check(key: string): Promise<{ ok: boolean; retryAfter: number }>;
}
