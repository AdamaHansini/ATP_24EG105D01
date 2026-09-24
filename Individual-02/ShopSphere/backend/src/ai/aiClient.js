// backend/src/ai/aiClient.js
import { GoogleGenAI } from '@google/genai';

let clientInstance = null;

export function getAiClient() {
  if (!clientInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. AI services will use intelligent domain heuristic fallback.');
      return null;
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
