// src/ai/flows/create-compliant-vin-label.ts
'use server';
/**
 * @fileOverview Flow to create compliant VIN labels from provided data, using generative AI to optimize information placement.
 *
 * - createCompliantVinLabel - A function that handles the VIN label creation process.
 * - CreateCompliantVinLabelInput - The input type for the createCompliantVinLabel function.
 * - CreateCompliantVinLabelOutput - The return type for the createCompliantVinLabel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateCompliantVinLabelInputSchema = z.object({
  vinData: z.string().describe('The VIN data to be included on the label.'),
  trailerSpecs: z.string().describe('The specifications of the trailer.'),
  regulatoryStandards: z.string().optional().describe('Any relevant regulatory standards.'),
  labelDimensions: z.string().describe('Label dimensions like width and height'),
});
export type CreateCompliantVinLabelInput = z.infer<typeof CreateCompliantVinLabelInputSchema>;

const CreateCompliantVinLabelOutputSchema = z.object({
  labelDataUri: z.string().describe('The data URI of the generated VIN label image.'),
  placementRationale: z.string().describe('The AI\s rationale for the information placement on the label.'),
});
export type CreateCompliantVinLabelOutput = z.infer<typeof CreateCompliantVinLabelOutputSchema>;

export async function createCompliantVinLabel(input: CreateCompliantVinLabelInput): Promise<CreateCompliantVinLabelOutput> {
  return createCompliantVinLabelFlow(input);
}

const createCompliantVinLabelPrompt = ai.definePrompt({
  name: 'createCompliantVinLabelPrompt',
  input: {schema: CreateCompliantVinLabelInputSchema},
  output: {schema: CreateCompliantVinLabelOutputSchema},
  prompt: `You are an expert in creating compliant VIN labels.

  Based on the provided VIN data, trailer specifications, regulatory standards, and label dimensions, generate a VIN label image and optimize information placement for readability and regulatory compliance.
  Explain the rationale for your placement strategy.

  VIN Data: {{{vinData}}}
  Trailer Specs: {{{trailerSpecs}}}
  Regulatory Standards: {{{regulatoryStandards}}}
  Label Dimensions: {{{labelDimensions}}}

  Return the data URI of the generated label image and your placement rationale.
  `,
});

const createCompliantVinLabelFlow = ai.defineFlow(
  {
    name: 'createCompliantVinLabelFlow',
    inputSchema: CreateCompliantVinLabelInputSchema,
    outputSchema: CreateCompliantVinLabelOutputSchema,
  },
  async input => {
    // Call the prompt to get the label data URI and placement rationale
    const {output} = await createCompliantVinLabelPrompt(input);

    return output!;
  }
);
