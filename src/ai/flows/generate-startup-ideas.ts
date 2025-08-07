'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating startup ideas based on a problem description and category.
 *
 * The flow takes a problem description and category as input and returns 3-5 startup ideas, each with a title, summary, and score.
 *
 * @fileOverview
 * - `generateStartupIdeas`: A function that takes a problem description and category, and returns a list of startup ideas.
 * - `StartupIdeasInput`: The input type for the generateStartupIdeas function.
 * - `StartupIdeasOutput`: The output type for the generateStartupIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StartupIdeasInputSchema = z.object({
  problemDescription: z
    .string()
    .describe('A description of the problem the startup will solve.'),
  category: z
    .string()
    .describe(
      'The category the startup falls under (e.g., Health, Finance, SaaS).'
    ),
});

export type StartupIdeasInput = z.infer<typeof StartupIdeasInputSchema>;

const StartupIdeaSchema = z.object({
  title: z.string().describe('The title of the startup idea.'),
  summary: z.string().describe('A brief summary of the startup idea.'),
  score: z
    .number()
    .describe(
      'A score indicating the potential of the startup idea (e.g., 1-10).'
    ),
});

const StartupIdeasOutputSchema = z.array(StartupIdeaSchema).describe(
  'An array of 3-5 startup ideas.'
);

export type StartupIdeasOutput = z.infer<typeof StartupIdeasOutputSchema>;

export async function generateStartupIdeas(
  input: StartupIdeasInput
): Promise<StartupIdeasOutput> {
  return generateStartupIdeasFlow(input);
}

const selectCategoryTool = ai.defineTool({
  name: 'selectCategory',
  description: 'Selects the most appropriate category for a given problem description.',
  inputSchema: z.object({
    problemDescription: z.string().describe('The problem description.'),
    suggestedCategory: z.string().describe('The category suggested by the user'),
  }),
  outputSchema: z.string().describe('The most appropriate category.'),
}, async (input) => {
  // In a real implementation, this would use an LLM or other method to select the best category.
  // For this example, we simply return the suggested category.
  return input.suggestedCategory;
});

const startupIdeasPrompt = ai.definePrompt({
  name: 'startupIdeasPrompt',
  input: {schema: StartupIdeasInputSchema},
  output: {schema: StartupIdeasOutputSchema},
  tools: [selectCategoryTool],
  prompt: `You are a startup idea generator. Generate 3-5 startup ideas based on the problem description and category provided.

  Problem Description: {{{problemDescription}}}
  Category: {{#tool_use "selectCategoryTool" problemDescription=problemDescription suggestedCategory=category}}{{tool_output}}{{/tool_use}}

  Each startup idea should have a title, a summary, and a score (1-10) indicating its potential. Return the ideas in JSON format.`, 
});

const generateStartupIdeasFlow = ai.defineFlow(
  {
    name: 'generateStartupIdeasFlow',
    inputSchema: StartupIdeasInputSchema,
    outputSchema: StartupIdeasOutputSchema,
  },
  async input => {
    const category = await selectCategoryTool({
      problemDescription: input.problemDescription,
      suggestedCategory: input.category,
    });

    const {output} = await startupIdeasPrompt({
      ...input,
      category: category
    });

    return output!;
  }
);
