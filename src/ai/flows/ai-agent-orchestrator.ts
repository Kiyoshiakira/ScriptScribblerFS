'use server';
/**
 * @fileOverview The main AI agent orchestrator.
 * This flow is responsible for interpreting user requests and dispatching them to the appropriate tools or sub-flows.
 *
 * - aiAgentOrchestrator - The main function that orchestrates the AI agent's response.
 * - AiAgentOrchestratorInput - The input type for the function.
 * - AiAgentOrchestratorOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  aiGenerateCharacterProfile,
  type AiGenerateCharacterProfileOutput,
} from './ai-generate-character-profile';
import {
  aiProofreadScript,
  type AiProofreadScriptOutput,
} from './ai-proofread-script';
import {
    aiReformatScript,
    type AiReformatScriptOutput,
} from './ai-reformat-script';

const AiGenerateCharacterProfileOutputSchema = z.object({
  name: z.string().describe("The character's full name."),
  profile: z
    .string()
    .describe(
      'A detailed character profile that includes backstory, personality, motivations, and quirks.'
    ),
});

const AiProofreadScriptOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      originalText: z.string(),
      correctedText: z.string(),
      explanation: z.string(),
    })
  ),
});

const AiReformatScriptOutputSchema = z.object({
    formattedScript: z.string(),
});


const AiAgentOrchestratorInputSchema = z.object({
  request: z.string().describe("The user's natural language request."),
  script: z.string().describe('The current state of the screenplay.'),
});
export type AiAgentOrchestratorInput = z.infer<
  typeof AiAgentOrchestratorInputSchema
>;

const AiAgentOrchestratorOutputSchema = z.object({
  response: z
    .string()
    .describe(
      "The AI's response to the user's request, which may include the results of tool calls."
    ),
  toolResult: z
    .any()
    .optional()
    .describe('The direct result from any tool that was called.'),
  modifiedScript: z
    .string()
    .optional()
    .describe(
      'The full, rewritten script content if the user requested a change.'
    ),
});
export type AiAgentOrchestratorOutput = z.infer<
  typeof AiAgentOrchestratorOutputSchema
>;

export async function aiAgentOrchestrator(
  input: AiAgentOrchestratorInput
): Promise<AiAgentOrchestratorOutput> {
  return aiAgentOrchestratorFlow(input);
}

// Define tools separately
const generateCharacterTool = ai.defineTool(
  {
    name: 'generateCharacter',
    description: 'Generates a new character profile based on a user description. Use this when the user explicitly asks to create, make, or generate a character.',
    inputSchema: z.object({
      description: z
        .string()
        .describe('A brief description of the character to be created.'),
    }),
    outputSchema: AiGenerateCharacterProfileOutputSchema,
  },
  async (toolInput): Promise<AiGenerateCharacterProfileOutput> => {
    return await aiGenerateCharacterProfile({
      characterDescription: toolInput.description,
    });
  }
);

const proofreadScriptTool = ai.defineTool(
    {
        name: 'proofreadScript',
        description: 'Proofreads the script for objective errors like spelling, grammar, and continuity mistakes. This tool does NOT change the story or structure.',
        inputSchema: z.object({
            script: z.string().describe('The full script to proofread.'),
        }),
        outputSchema: AiProofreadScriptOutputSchema,
    },
    async ({script}): Promise<AiProofreadScriptOutput> => {
        return await aiProofreadScript({ script });
    }
);

const reformatScriptTool = ai.defineTool(
    {
        name: 'reformatScript',
        description: 'Reformats the entire script into standard screenplay format. Use this when the user asks to "reformat", "clean up", "fix formatting", or says the script is "squished" or "unstructured".',
        inputSchema: z.object({
            script: z.string().describe('The full script content to reformat.'),
        }),
        outputSchema: AiReformatScriptOutputSchema,
    },
     async ({script}): Promise<AiReformatScriptOutput> => {
        return await aiReformatScript({ rawScript: script });
    }
);

const orchestratorPrompt = `You are an expert AI assistant for a screenwriting application.
Your goal is to help the user modify their script and other project elements.

Analyze the user's request and the current script content to determine the user's intent.

- **IF the user asks to create a character**, use the \`generateCharacter\` tool.
- **IF the user asks to proofread, check for errors, or find mistakes**, use the \`proofreadScript\` tool.
- **IF the user asks to reformat, clean up the layout, or fix formatting (e.g., "it's too squished")**, use the \`reformatScript\` tool.
- **IF the user asks for a direct change to the story or dialogue (and not just reformatting or proofreading)**, you must rewrite the script yourself. In this case, do not call a tool, and instead just provide the full new content in the 'modifiedScript' field of your response.
- **IF the user is asking a general question or for analysis**, respond directly with text and do not use a tool.

**User Request:**
{{{request}}}

**Current Screenplay:**
---
{{{script}}}
---
`;


const aiAgentOrchestratorFlow = ai.defineFlow(
  {
    name: 'aiAgentOrchestratorFlow',
    inputSchema: AiAgentOrchestratorInputSchema,
    outputSchema: AiAgentOrchestratorOutputSchema,
  },
  async (input) => {
    // STEP 1: Tool-Selection-Only Generation
    // Force the model to decide on an action (call a tool or write a script) without generating conversational text yet.
    let decision = await ai.generate({
      prompt: orchestratorPrompt,
      input,
      tools: [generateCharacterTool, proofreadScriptTool, reformatScriptTool],
      output: {
        format: 'json',
        schema: z.object({
          thoughts: z.string().describe("A brief analysis of the user's request to decide on a course of action."),
          modifiedScript: z
            .string()
            .optional()
            .describe(
              "If the request requires a direct script change, this is the FULL new script. Omit if calling a tool."
            ),
        }),
      },
    });

    let toolResult: any = null;
    let modifiedScript = decision.output?.modifiedScript;

    // STEP 2: Execute the chosen tool, if any.
    if (decision.toolRequests.length > 0) {
        const toolRequest = decision.toolRequests[0]; // Assume one tool for now
        const toolOutput = await toolRequest.run();
        
        let toolType: string | null = null;
        if (toolRequest.name === 'generateCharacter') toolType = 'character';
        if (toolRequest.name === 'proofreadScript') toolType = 'proofread';
        if (toolRequest.name === 'reformatScript') {
             toolType = 'reformat';
             modifiedScript = (toolOutput as AiReformatScriptOutput).formattedScript;
        }

        toolResult = {
            type: toolType,
            data: toolOutput,
        };
    }
    
    // If we have a result (either from a direct script modification or a tool), we generate a final response.
    if (modifiedScript || toolResult) {
        // STEP 3: Generate the final conversational response based on the action taken.
        const finalResponse = await ai.generate({
            prompt: `You are an expert AI assistant. Based on the user's request, an action was just performed.
            - If a script was modified, state that clearly.
            - If a character was generated, present the character.
            - If proofreading was done, summarize what you found.
            - If reformatting was done, confirm it.

            Keep your response concise and friendly.

            User Request: "${input.request}"
            Action Result: ${JSON.stringify(toolResult || { action: 'Direct Script Modification' })}
            `,
            output: {
                format: 'json',
                schema: z.object({
                    response: z.string().describe("The AI's friendly, conversational response to the user, summarizing the action taken."),
                })
            }
        });
        
        return {
            response: finalResponse.output?.response || "I've completed your request.",
            modifiedScript: modifiedScript,
            toolResult: toolResult,
        };
    }

    // If no tool was called and no script was modified, it's likely a general question.
    const generalResponse = await ai.generate({
        prompt: `You are an expert AI assistant. The user asked: "${input.request}". The script content is: ---{{{script}}}---. Provide a helpful, conversational answer to their question.`,
        input,
    });

    return {
      response: generalResponse.text,
    };
  }
);
