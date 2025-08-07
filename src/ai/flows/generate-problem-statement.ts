'use server';
/**
 * @fileOverview A flow to generate a startup problem statement.
 *
 * - generateProblemStatement - A function that generates a problem statement based on a category and an idea.
 * - GenerateProblemStatementInput - The input type for the generateProblemStatement function.
 * - GenerateProblemStatementOutput - The return type for the generateProblemStatement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProblemStatementInputSchema = z.object({
  targetCustomer: z.string().describe('The target customer to generate problems for.'),
});
export type GenerateProblemStatementInput = z.infer<typeof GenerateProblemStatementInputSchema>;

const GenerateProblemStatementOutputSchema = z.object({
  problemStatement: z.string().describe('A list of the top 3 recurring problems for the target customer.'),
});
export type GenerateProblemStatementOutput = z.infer<typeof GenerateProblemStatementOutputSchema>;

export async function generateProblemStatement(input: GenerateProblemStatementInput): Promise<GenerateProblemStatementOutput> {
  return generateProblemStatementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProblemStatementPrompt',
  input: {schema: GenerateProblemStatementInputSchema},
  output: {schema: GenerateProblemStatementOutputSchema},
  prompt: `List the top 3 recurring problems faced by {{{targetCustomer}}}. Focus on what tasks are frustrating, what blockers exist, and why these problems are painful for them. Return results as bullet points.`,
});

const generateProblemStatementFlow = ai.defineFlow(
  {
    name: 'generateProblemStatementFlow',
    inputSchema: GenerateProblemStatementInputSchema,
    outputSchema: GenerateProblemStatementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
