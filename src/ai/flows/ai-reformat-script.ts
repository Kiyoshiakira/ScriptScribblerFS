```typescript
'use server';
/**
 * @fileOverview An AI flow for reformatting script text into standard screenplay format.
 *
 * - aiReformatScript - A function that takes raw text and reformats it.
 * - AiReformatScriptInput - The input type for the function.
 * - AiReformatScriptOutput - The return type for the function.
 */

import { ai, isAiAvailable } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const AiReformatScriptInputSchema = z.object({
  rawScript: z
    .string()
    .describe('The raw, potentially poorly formatted, script text.'),
});
export type AiReformatScriptInput = z.infer<
  typeof AiReformatScriptInputSchema
>;

const AiReformatScriptOutputSchema = z.object({
  formattedScript: z
    .string()
    .describe(
      'The script text, reformatted to meet standard screenplay conventions.'
    ),
  // optional diagnostic flag to indicate the output is a fallback
  __debug?: z
    .object({
      fallback: z.boolean().optional(),
      model: z.string().optional(),
      rawResponse: z.any().optional(),
    })
    .optional(),
});
export type AiReformatScriptOutput = z.infer<
  typeof AiReformatScriptOutputSchema
>;

export async function aiReformatScript(
  input: AiReformatScriptInput
): Promise<AiReformatScriptOutput> {
  return aiReformatScriptFlow(input);
}

const prompt = ai.definePrompt({
    name: 'reformatScriptPrompt',
    input: { schema: AiReformatScriptInputSchema },
    output: { schema: AiReformatScriptOutputSchema },
    prompt: `You are an expert script formatter.

  Your task is to take the provided raw text and reformat it into a clean, readable, industry-standard screenplay format.

  **Instructions:**
  1.  Identify Scene Headings (e.g., "INT. ROOM - DAY") and format them correctly on their own line and in all caps.
  2.  Identify Character names (e.g., "JOHN DOE") and place them on their own line, in all caps, and centered.
  3.  Identify Dialogue and place it directly below the character name.
  4.  Identify Parentheticals (e.g., "(beat)") and place them on their own line, indented, between the character and dialogue.
  5.  Identify Action lines (scene descriptions) and format them as standard paragraphs.
  6.  Ensure there are appropriate blank lines between elements for readability (e.g., before scene headings, between a character's dialogue and the next character).

  **Raw Script Text to Reformat:**
  \`\`\`
  {{{rawScript}}}
  \`\`\`
  `,
});

const aiReformatScriptFlow = ai.defineFlow(
  {
    name: 'aiReformatScriptFlow',
    inputSchema: AiReformatScriptInputSchema,
    outputSchema: AiReformatScriptOutputSchema,
  },
  async input => {
    // If AI not available (missing API key), gracefully return the raw script as formatted
    if (!isAiAvailable) {
      return { formattedScript: input.rawScript, __debug: { fallback: true, model: 'none', rawResponse: 'GEMINI_API_KEY missing' } };
    }

    // Helper to attempt a generation with a specified model and config
    async function attemptGeneration(modelId: string, temperature = 0) {
      const model = googleAI(modelId);
      try {
        const { output, raw } = await ai.generate({
          model,
          prompt: prompt,
          input: input,
          output: { schema: AiReformatScriptOutputSchema },
          config: {
            temperature,
          },
        });
        return { output, raw };
      } catch (err) {
        // rethrow so caller knows the attempt failed
        throw err;
      }
    }

    // First try primary model
    let primaryResponse;
    try {
      primaryResponse = await attemptGeneration('gemini-2.5-flash', 0);
    } catch (errPrimary) {
      console.error('[aiReformatScriptFlow] Primary generation error:', errPrimary);
      // Try a fallback model once
      try {
        const fallbackResponse = await attemptGeneration('gemini-1.5', 0);
        // Validate fallback output
        if (fallbackResponse?.output?.formattedScript && typeof fallbackResponse.output.formattedScript === 'string') {
          return {
            formattedScript: fallbackResponse.output.formattedScript,
            __debug: {
              fallback: true,
              model: 'gemini-1.5',
              rawResponse: fallbackResponse.raw ?? null,
            },
          };
        } else {
          // If even fallback returned invalid shape, log the raw response
          console.error('[aiReformatScriptFlow] Fallback response invalid shape:', fallbackResponse?.raw ?? fallbackResponse);
          // Final fallback: return original script so import can proceed
          return {
            formattedScript: input.rawScript,
            __debug: {
              fallback: true,
              model: 'gemini-1.5',
              rawResponse: fallbackResponse?.raw ?? null,
            },
          };
        }
      } catch (errFallback) {
        console.error('[aiReformatScriptFlow] Fallback generation error:', errFallback);
        // Final fallback: return original script so import can proceed
        return {
          formattedScript: input.rawScript,
          __debug: {
            fallback: true,
            model: 'none',
            rawResponse: String(errFallback),
          },
        };
      }
    }

    // If primary succeeded, validate the output shape
    if (!primaryResponse || !primaryResponse.output) {
      console.error('[aiReformatScriptFlow] Primary generation returned no output', primaryResponse?.raw ?? primaryResponse);
      // Try fallback model once
      try {
        const fallbackResponse = await attemptGeneration('gemini-1.5', 0);
        if (fallbackResponse?.output?.formattedScript && typeof fallbackResponse.output.formattedScript === 'string') {
          return {
            formattedScript: fallbackResponse.output.formattedScript,
            __debug: {
              fallback: true,
              model: 'gemini-1.5',
              rawResponse: fallbackResponse.raw ?? null,
            },
          };
        } else {
          console.error('[aiReformatScriptFlow] Fallback response invalid shape:', fallbackResponse?.raw ?? fallbackResponse);
          return { formattedScript: input.rawScript, __debug: { fallback: true, model: 'gemini-1.5', rawResponse: fallbackResponse?.raw ?? null } };
        }
      } catch (errFallback2) {
        console.error('[aiReformatScriptFlow] Fallback attempt after empty output failed:', errFallback2);
        return { formattedScript: input.rawScript, __debug: { fallback: true, model: 'none', rawResponse: String(errFallback2) } };
      }
    }

    // primaryResponse has output: validate it
    const out = primaryResponse.output;
    if (out.formattedScript && typeof out.formattedScript === 'string') {
      return { formattedScript: out.formattedScript, __debug: { fallback: false, model: 'gemini-2.5-flash', rawResponse: primaryResponse.raw ?? null } };
    }

    // If we reach here, output is malformed — attempt one retry with same model but a slightly different config
    console.warn('[aiReformatScriptFlow] Primary output malformed, attempting retry with temperature 0.1');
    try {
      const retryResponse = await attemptGeneration('gemini-2.5-flash', 0.1);
      if (retryResponse?.output?.formattedScript && typeof retryResponse.output.formattedScript === 'string') {
        return { formattedScript: retryResponse.output.formattedScript, __debug: { fallback: false, model: 'gemini-2.5-flash-retry', rawResponse: retryResponse.raw ?? null } };
      } else {
        console.error('[aiReformatScriptFlow] Retry response invalid shape:', retryResponse?.raw ?? retryResponse);
        return { formattedScript: input.rawScript, __debug: { fallback: true, model: 'gemini-2.5-flash-retry', rawResponse: retryResponse?.raw ?? null } };
      }
    } catch (errRetry) {
      console.error('[aiReformatScriptFlow] Retry failed:', errRetry);
      return { formattedScript: input.rawScript, __debug: { fallback: true, model: 'gemini-2.5-flash-retry', rawResponse: String(errRetry) } };
    }
  }
);
```