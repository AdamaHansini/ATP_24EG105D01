// backend/src/ai/aiClient.js
import { GoogleGenAI } from '@google/genai';

let clientInstance = null;

export function getAiClient() {
  if (!clientInstance) {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      const error = new Error('AI features are unavailable until GEMINI_API_KEY is configured in the backend environment.');
      error.statusCode = 503;
      error.errorCode = 'AI_PROVIDER_UNAVAILABLE';
      error.expose = true;
      throw error;
    }
    clientInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        timeout: 40000,
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return clientInstance;
}

export function toAiProviderError(cause, operation = 'AI request') {
  if (cause?.errorCode && cause?.statusCode) return cause;

  const providerStatus = Number(cause?.status || cause?.statusCode);
  const isCredentialError = providerStatus === 401 || providerStatus === 403;
  const isRateLimited = providerStatus === 429;
  const isTimeout = cause?.code === 'ETIMEDOUT' || cause?.name === 'TimeoutError';

  console.error(`[ai] ${operation} failed:`, cause?.name || 'Error', providerStatus || cause?.code || 'unknown');

  const error = new Error(
    isCredentialError
      ? 'The AI provider rejected its credentials. Check GEMINI_API_KEY in the backend environment.'
      : isRateLimited
        ? 'The AI provider is temporarily rate-limited. Please try again later.'
        : isTimeout
          ? 'The AI provider took too long to respond. Please try again.'
          : 'AI generation is temporarily unavailable. Please try again.'
  );
  error.statusCode = isCredentialError || isRateLimited || isTimeout ? 503 : 502;
  error.errorCode = isCredentialError
    ? 'AI_PROVIDER_UNAVAILABLE'
    : isRateLimited
      ? 'AI_RATE_LIMITED'
      : isTimeout
        ? 'AI_PROVIDER_TIMEOUT'
        : 'AI_PROVIDER_ERROR';
  error.expose = true;
  return error;
}
