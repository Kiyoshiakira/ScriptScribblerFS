import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Initialize the Google AI plugin only if the API key is present.
// If the key is missing we still export 'ai' but with no plugin so
// the framework won't attempt calls that would immediately error.
const googleAiPlugin = process.env.GEMINI_API_KEY
  ? googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    })
  : null;

export const ai = genkit({
  plugins: googleAiPlugin ? [googleAiPlugin] : [],
});

// Export a helper so callers can detect that AI calls will fail due to missing key.
export const isAiAvailable = Boolean(googleAiPlugin);
