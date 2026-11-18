import type { ApiConfig, ApiProviderType } from '@/types/uphone';

export interface AiChatMessageInput {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiCompletionRequest {
  config: Pick<ApiConfig, 'provider' | 'baseUrl' | 'model' | 'temperature' | 'maxTokens' | 'topP'>;
  messages: AiChatMessageInput[];
  signal?: AbortSignal;
}

export interface AiCompletionResponse {
  text: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface AiServiceClient {
  completeChat(request: AiCompletionRequest): Promise<AiCompletionResponse>;
}

export class AiServiceNotConfiguredError extends Error {
  readonly code = 'AI_SERVICE_NOT_IMPLEMENTED';

  constructor(provider: ApiProviderType) {
    super(`AI API adapter for "${provider}" is reserved for a later milestone.`);
    this.name = 'AiServiceNotConfiguredError';
  }
}

export function normalizeProviderBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

/**
 * Reserved AI API request layer stub.
 * Concrete provider transport adapters will be implemented in the AI API management phase.
 */
export const aiApiClient: AiServiceClient = {
  async completeChat(request: AiCompletionRequest): Promise<AiCompletionResponse> {
    throw new AiServiceNotConfiguredError(request.config.provider);
  },
};
