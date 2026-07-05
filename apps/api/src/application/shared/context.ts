// Per-request authenticated context, built by the api/_lib/with-user composition root.
export interface AuthedContext {
  userId: string;
  origin: string;
  headers: Headers;
}
