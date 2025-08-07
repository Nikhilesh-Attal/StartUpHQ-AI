'use server';
/**
 * @fileOverview A Lean Canvas block suggestion AI agent.
 *
 * - aiSuggestLeanCanvasBlock - A function that handles the lean canvas block suggestion process.
 * - AiSuggestLeanCanvasBlockInput - The input type for the aiSuggestLeanCanvasBlock function.
 * - AiSuggestLeanCanvasBlockOutput - The return type for the aiSuggestLeanCanvasBlock function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiSuggestLeanCanvasBlockInputSchema = z.object({
  blockName: z.string().describe('The name of the Lean Canvas block to generate a suggestion for.'),
  currentContent: z.string().describe('The current content of the Lean Canvas block.'),
  previousAttempts: z.array(z.string()).optional().describe('The previous attempts to generate content for this block.'),
  startupName: z.string().optional().describe('The name of the startup (for context).'),
  startupDescription: z.string().optional().describe('The description of the startup (for context).'),
});

export type AiSuggestLeanCanvasBlockInput = z.infer<typeof AiSuggestLeanCanvasBlockInputSchema>;

const AiSuggestLeanCanvasBlockOutputSchema = z.object({
  suggestion: z.string().describe('The AI-generated suggestion for the Lean Canvas block.'),
  reasoning: z.string().optional().describe('Reasoning or explanation for the suggestion.'), // optional
});

export type AiSuggestLeanCanvasBlockOutput = z.infer<typeof AiSuggestLeanCanvasBlockOutputSchema>;

export async function aiSuggestLeanCanvasBlock(input: AiSuggestLeanCanvasBlockInput): Promise<AiSuggestLeanCanvasBlockOutput> {
  return aiSuggestLeanCanvasBlockFlow(input);
}

const aiSuggestLeanCanvasBlockPrompt = ai.definePrompt({
  name: 'aiSuggestLeanCanvasBlockPrompt',
  input: { schema: AiSuggestLeanCanvasBlockInputSchema },
  output: { schema: AiSuggestLeanCanvasBlockOutputSchema },
  prompt: `
You are an expert startup coach helping founders improve their Lean Canvas.

{% if startupName && startupDescription %}
The startup you're helping is called "{{startupName}}".

Description:
{{startupDescription}}
{% endif %}

You are currently helping the user with the "{{blockName}}" block.

Here’s the current content of this block:
{{currentContent}}

{% if previousAttempts && previousAttempts.length > 0 %}
Here are previous suggestions the user didn't like:
{{#each previousAttempts}}
- {{this}}
{{/each}}
{% endif %}

Please generate a better suggestion that is:
- Concise
- Practical
- Startup-relevant
- Unique (not similar to previous attempts)

Also explain briefly why your suggestion fits well.

Respond in the following format:

Suggestion:
<your suggestion here>

Reasoning:
<why this works>
`,
});

const aiSuggestLeanCanvasBlockFlow = ai.defineFlow(
  {
    name: 'aiSuggestLeanCanvasBlockFlow',
    inputSchema: AiSuggestLeanCanvasBlockInputSchema,
    outputSchema: AiSuggestLeanCanvasBlockOutputSchema,
  },
  async input => {
    const rawOutput = await aiSuggestLeanCanvasBlockPrompt(input);

    // Simple parser to extract "Suggestion" and "Reasoning"
    const text = rawOutput.output?.trim() || '';
    const suggestionMatch = text.match(/Suggestion:\s*([\s\S]*?)(?:Reasoning:|$)/i);
    const reasoningMatch = text.match(/Reasoning:\s*([\s\S]*)/i);

    return {
      suggestion: suggestionMatch?.[1]?.trim() || text,
      reasoning: reasoningMatch?.[1]?.trim() || '',
    };
  }
);
