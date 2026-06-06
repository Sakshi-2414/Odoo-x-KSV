import { GoogleGenAI } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set in environment variables');
}

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

// gemini-2.5-flash is available on the free tier (up to 15 RPM)
export const MODEL_NAME = 'gemini-2.5-flash';

// Helper for Free Tier Rate Limits (429 Too Many Requests)
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && error?.status === 429) {
      console.warn(`Rate limit hit (Free Tier). Retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return withRetry(fn, retries - 1, delayMs * 2);
    }
    throw error;
  }
}
