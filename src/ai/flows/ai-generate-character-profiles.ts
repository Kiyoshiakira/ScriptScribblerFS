'use server';

/**
 * @fileOverview AI tool that reviews existing screenplay, offers potential paths that story may take, 
 * provides alternatives or missing information (such as character descriptions, world or environment, sounds, scene descriptions).
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
    .describe("A brief description or traits of the character."),
});

export type GenerateCharacterProfilesInput = z.infer<typeof GenerateCharacterProfilesInputSchema>;

const GenerateCharacterProfilesOutputSchema = z.object({
  characterProfile: z
    .string()
    .describe("A detailed character profile based on the input description."),
});

export type GenerateCharacterProfilesOutput = z.infer<typeof GenerateCharacterProfilesOutputSchema>;

export async function generateCharacterProfiles(input: GenerateCharacterProfilesInput): Promise<GenerateCharacterProfilesOutput> {
  return generateCharacterProfilesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCharacterProfilesPrompt',
  input: {schema: GenerateCharacterProfilesInputSchema},
  output: {schema: GenerateCharacterProfilesOutputSchema},
  prompt: `You are an expert screenwriter assistant.

  Based on the provided character description, generate a detailed character profile. The profile should include details such as:

  - Full Name
  - Age
  - Occupation
  - Physical Appearance
  - Personality Traits
  - Backstory
  - Motivations
  - Relationships with other characters (if known)
  - Any quirks or unique characteristics

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
