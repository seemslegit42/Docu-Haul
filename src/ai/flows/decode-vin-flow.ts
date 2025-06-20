
'use server';
/**
 * @fileOverview A flow for decoding a Vehicle Identification Number (VIN) into its constituent parts.
 *
 * - decodeVin - A function that performs the VIN decoding.
 * - DecodeVinInput - The input type for the decodeVin function.
 * - DecodeVinOutput - The return type for the decodeVin function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { DecodeVinInputSchema } from '@/lib/schemas';

export type DecodeVinInput = z.infer<typeof DecodeVinInputSchema>;

const VinPartSchema = z.object({
  value: z.string().describe("The substring of the VIN corresponding to this part."),
  description: z.string().describe("A brief explanation of what this part of the VIN represents."),
});

const VinDescriptorSchema = VinPartSchema.extend({
  trailerType: z.string().describe("Decoded trailer type from digit 4."),
  bodyType: z.string().describe("Decoded body type from digit 5."),
  bodyLength: z.string().describe("Decoded body length from digits 6-7."),
  numberOfAxles: z.string().describe("Decoded number of axles from digit 8."),
});

const DecodeVinOutputSchema = z.object({
  wmi: VinPartSchema.describe("World Manufacturer Identifier (Digits 1-3)."),
  vehicleDescriptors: VinDescriptorSchema.describe("Vehicle Descriptors (Digits 4-8)."),
  checkDigit: VinPartSchema.describe("Check Digit (Digit 9)."),
  modelYear: VinPartSchema.describe("Model Year (Digit 10)."),
  plant: VinPartSchema.describe("Plant Code (Digit 11)."),
  sequentialNumber: VinPartSchema.describe("Sequential Production Number (Digits 12-17)."),
  fullVin: z.string().describe("The full VIN that was decoded."),
});
export type DecodeVinOutput = z.infer<typeof DecodeVinOutputSchema>;

export async function decodeVin(input: DecodeVinInput): Promise<DecodeVinOutput> {
  return decodeVinFlow(input);
}

const prompt = ai.definePrompt({
  name: 'decodeVinPrompt',
  input: {schema: DecodeVinInputSchema},
  output: {schema: DecodeVinOutputSchema},
  prompt: `You are an expert VIN (Vehicle Identification Number) decoder for trailers.
Your task is to decode the provided 17-digit VIN based on the structural rules below.

VIN to decode: {{{vin}}}

Here is the VIN structure:
- **Digits 1-3 (WMI - World Manufacturer Identifier)**: Identifies the manufacturer.
- **Digits 4-8 (Vehicle Descriptors)**:
  - **Digit 4**: Trailer Type.
  - **Digit 5**: Body Type.
  - **Digits 6-7**: Body Length.
  - **Digit 8**: Number of Axles.
- **Digit 9 (Check Digit)**: A calculated digit for validation. Your description should state that it's a calculated value.
- **Digit 10 (Model Year)**: Represents the model year.
- **Digit 11 (Plant)**: The manufacturing plant code.
- **Digits 12-17 (Sequential Production Number)**:
  - For manufacturers producing > 999 units/year, digits 12-17 are a 6-digit sequential number.
  - For manufacturers producing <= 999 units/year, digits 12-14 are a WMI extension, and digits 15-17 are a 3-digit sequential number (001-999). Briefly mention this rule in the sequentialNumber description.

Based on this structure, break down the VIN '{{{vin}}}' into the specified parts. For each part, provide the corresponding substring from the VIN as 'value' and an explanation as 'description'. For the 'vehicleDescriptors', also provide the decoded values for trailerType, bodyType, etc.

Do not invent or hallucinate information. Your analysis should be based solely on the positional information provided.
The fullVin output field should be the original VIN '{{{vin}}}'.
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  },
});

const decodeVinFlow = ai.defineFlow(
  {
    name: 'decodeVinFlow',
    inputSchema: DecodeVinInputSchema,
    outputSchema: DecodeVinOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      console.error('VIN decoder AI model returned null output.', {input});
      throw new Error('VIN decoding failed to produce an output from the AI model.');
    }
    return output;
  }
);
