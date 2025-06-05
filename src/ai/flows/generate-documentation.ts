// src/ai/flows/generate-documentation.ts
'use server';
/**
 * @fileOverview A flow for generating vehicle documentation from VIN and trailer specifications.
 *
 * - generateDocumentation - A function that generates the documentation.
 * - GenerateDocumentationInput - The input type for the generateDocumentation function.
 * - GenerateDocumentationOutput - The return type for the generateDocumentation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDocumentationInputSchema = z.object({
  vin: z.string().describe('The Vehicle Identification Number.'),
  trailerSpecs: z.string().describe('The trailer specifications.'),
});
export type GenerateDocumentationInput = z.infer<typeof GenerateDocumentationInputSchema>;

const GenerateDocumentationOutputSchema = z.object({
  documentText: z.string().describe('The generated vehicle documentation.'),
});
export type GenerateDocumentationOutput = z.infer<typeof GenerateDocumentationOutputSchema>;

export async function generateDocumentation(input: GenerateDocumentationInput): Promise<GenerateDocumentationOutput> {
  return generateDocumentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDocumentationPrompt',
  input: {schema: GenerateDocumentationInputSchema},
  output: {schema: GenerateDocumentationOutputSchema},
  prompt: `You are an expert in generating vehicle documentation based on VIN and trailer specifications.

  Generate the necessary documentation using the following information:

  VIN: {{{vin}}}
  Trailer Specifications: {{{trailerSpecs}}}

  Ensure the documentation includes all relevant details and complies with regulatory standards where needed.`,
});

const generateDocumentationFlow = ai.defineFlow(
  {
    name: 'generateDocumentationFlow',
    inputSchema: GenerateDocumentationInputSchema,
    outputSchema: GenerateDocumentationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
