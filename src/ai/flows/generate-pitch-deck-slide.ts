'use server';

/**
 * @fileOverview A flow to generate content for a specific slide in a pitch deck.
 *
 * - generatePitchDeckSlide - A function that generates content for a given pitch deck slide.
 * - GeneratePitchDeckSlideInput - The input type for the generatePitchDeckSlide function.
 * - GeneratePitchDeckSlideOutput - The return type for the generatePitchDeckSlide function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePitchDeckSlideInputSchema = z.object({
  topic: z.string().describe('The topic of the pitch deck slide.'),
  existingContent: z.string().optional().describe('Existing content on the slide, if any.'),
});
export type GeneratePitchDeckSlideInput = z.infer<
  typeof GeneratePitchDeckSlideInputSchema
>;

const GeneratePitchDeckSlideOutputSchema = z.object({
  slideContent: z.string().describe('The AI-generated content for the slide.'),
});
export type GeneratePitchDeckSlideOutput = z.infer<
  typeof GeneratePitchDeckSlideOutputSchema
>;

export async function generatePitchDeckSlide(
  input: GeneratePitchDeckSlideInput
): Promise<GeneratePitchDeckSlideOutput> {
  return generatePitchDeckSlideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePitchDeckSlidePrompt',
  input: {schema: GeneratePitchDeckSlideInputSchema},
  output: {schema: GeneratePitchDeckSlideOutputSchema},
  prompt: `You are an AI assistant helping generate content for a pitch deck slide.

The topic of the slide is: {{{topic}}}.

{{#if existingContent}}
Here is some existing content on the slide that you should improve or expand upon:\n{{{existingContent}}}
{{/if}}

Generate compelling content for this slide. Focus on making it concise and persuasive.
`,
});

const generatePitchDeckSlideFlow = ai.defineFlow(
  {
    name: 'generatePitchDeckSlideFlow',
    inputSchema: GeneratePitchDeckSlideInputSchema,
    outputSchema: GeneratePitchDeckSlideOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
