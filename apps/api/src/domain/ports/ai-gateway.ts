// Port: the upstream AI chat provider. Framework-free; infrastructure implements it.
export interface AiGateway {
  createSession(origin: string): Promise<string>;
  sendMessage(perfect10SessionId: string, content: string, origin: string): Promise<number>;
  streamReply(assistantMessageId: number, origin: string): Promise<ReadableStream<Uint8Array>>;
}
