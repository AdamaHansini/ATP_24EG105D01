// backend/src/ai/aiClient.js
import { GoogleGenAI } from '@google/genai';

let clientInstance = null;

export function getAiClient() {
  if (!clientInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const error = new Error('AI features are unavailable until GEMINI_API_KEY is configured in backend/.env.');
      error.statusCode = 503;
      error.errorCode = 'AI_PROVIDER_UNAVAILABLE';
      error.expose = true;
      throw error;
    }
    clientInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return clientInstance;
}
