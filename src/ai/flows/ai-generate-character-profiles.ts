'use server';

/**
 * @fileOverview AI tool for generating detailed character profiles.
 *
 * - generateCharacterProfiles - A function that handles the character profile generation process.
 * - GenerateCharacterProfilesInput - The input type for the generateCharacterProfiles function.
 * - GenerateCharacterProfilesOutput - The return type for the generateCharacterProfiles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCharacterProfilesInputSchema = z.object({
  characterDescription: z
    .string()
    .describe('A brief description or traits of the character.'),
});

export type GenerateCharacterProfilesInput = z.infer<
  typeof GenerateCharacterProfilesInputSchema
>;

const GenerateCharacterProfilesOutputSchema = z.object({
  name: z.string().describe("The character's full name."),
  profile: z
    .string()
    .describe(
      'A detailed character profile that includes backstory, personality, motivations, and quirks.'
    ),
});

export type GenerateCharacterProfilesOutput = z.infer<
  typeof GenerateCharacterProfilesOutputSchema
>;

export async function generateCharacterProfiles(
  input: GenerateCharacterProfilesInput
): Promise<GenerateCharacterProfilesOutput> {
  return generateCharacterProfilesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCharacterProfilesPrompt',
  input: {schema: GenerateCharacterProfilesInputSchema},
  output: {schema: GenerateCharacterProfilesOutputSchema},
  prompt: `You are an expert screenwriter and character creator.

  Based on the provided character description, generate a plausible full name and a detailed character profile. The profile should be a rich narrative including:

  - Backstory and formative experiences.
  - Core personality traits, strengths, and flaws.
  - Motivations, goals, and fears.
  - Any interesting quirks or unique characteristics.

  Character Description: {{{characterDescription}}}
  `,
});

const generateCharacterProfilesFlow = ai.defineFlow(
  {
    name: 'generateCharacterProfilesFlow',
    inputSchema: GenerateCharacterProfilesInputSchema,
    outputSchema: GenerateCharacterProfilesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
