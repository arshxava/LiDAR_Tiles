'use server';

/**
 * @fileOverview An AI agent that suggests annotations based on LiDAR data patterns.
 *
 * - suggestAnnotations - A function that suggests annotations based on LiDAR data.
 * - SuggestAnnotationsInput - The input type for the suggestAnnotations function.
 * - SuggestAnnotationsOutput - The return type for the suggestAnnotations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAnnotationsInputSchema = z.object({
  lidarData: z
    .string()
    .describe(
      'LiDAR data as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
  annotationInstructions: z
    .string()
    .describe(
      'Instructions for the type of annotations the user is looking for.'
    ),
});
export type SuggestAnnotationsInput = z.infer<typeof SuggestAnnotationsInputSchema>;

const SuggestAnnotationsOutputSchema = z.object({
  suggestedAnnotations: z
    .string()
    .describe(
      'Suggested annotations based on the LiDAR data patterns, in a format suitable for display on a map (e.g., GeoJSON).' + 
      'If the AI determines that no annotations are warranted, it should return an empty GeoJSON FeatureCollection.'
    ),
  reasoning: z
    .string()
    .describe(
      'The AI’s reasoning for the suggested annotations, explaining the patterns observed in the LiDAR data.'
    ),
});
export type SuggestAnnotationsOutput = z.infer<typeof SuggestAnnotationsOutputSchema>;

export async function suggestAnnotations(input: SuggestAnnotationsInput): Promise<SuggestAnnotationsOutput> {
  return suggestAnnotationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAnnotationsPrompt',
  input: {schema: SuggestAnnotationsInputSchema},
  output: {schema: SuggestAnnotationsOutputSchema},
  prompt: `You are an expert in analyzing LiDAR data and suggesting relevant annotations.

  Based on the LiDAR data provided and the annotation instructions, identify patterns and suggest annotations.

  LiDAR Data: {{media url=lidarData}}
  Annotation Instructions: {{{annotationInstructions}}}

  Consider the following:
  - The type of features the user is looking for based on annotationInstructions.
  - Any patterns or anomalies in the LiDAR data that might be relevant.

  If no annotations are warranted given the data, return an empty GeoJSON FeatureCollection.

  Return the suggested annotations in GeoJSON format and explain your reasoning.
`,
});

const suggestAnnotationsFlow = ai.defineFlow(
  {
    name: 'suggestAnnotationsFlow',
    inputSchema: SuggestAnnotationsInputSchema,
    outputSchema: SuggestAnnotationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
