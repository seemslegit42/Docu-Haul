'use server';
/**
 * @fileOverview A flow for decoding a Vehicle Identification Number (VIN). This flow first parses the VIN in code, then uses AI to provide human-readable descriptions for each component.
 *
 * - decodeVin - A function that performs the VIN decoding.
 * - DecodeVinOutput - The return type for the decodeVin function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { type DecodeVinInput, DecodeVinSchema } from '@/lib/schemas';
import { defaultSafetySettings } from '@/ai/safety-settings';
import { createAuthenticatedFlow } from './utils/authWrapper';

// Schema for the individual parts of a VIN
const VinPartSchema = z.object({
  value: z.string().describe("The substring of the VIN corresponding to this part."),
  description: z.string().describe("A brief explanation of what this part of the VIN represents."),
});

// Schema for the decoded vehicle descriptors
const VinDescriptorSchema = VinPartSchema.extend({
  trailerType: z.string().describe("Decoded trailer type (e.g., 'Flatbed', 'Gooseneck')."),
  bodyType: z.string().describe("Decoded body type (e.g., 'Steel Frame', 'Aluminum')."),
  bodyLength: z.string().describe("Decoded body length (e.g., '20 feet', '40 feet')."),
  numberOfAxles: z.string().describe("Decoded number of axles (e.g., '2 Axles', '3 Axles')."),
});

// The final, structured output for the entire decoded VIN
export const DecodeVinOutputSchema = z.object({
  wmi: VinPartSchema.describe("World Manufacturer Identifier (Digits 1-3)."),
  vehicleDescriptors: VinDescriptorSchema.describe("Vehicle Descriptors (Digits 4-8)."),
  checkDigit: VinPartSchema.describe("Check Digit (Digit 9)."),
  modelYear: VinPartSchema.describe("Model Year (Digit 10)."),
  plant: VinPartSchema.describe("Plant Code (Digit 11)."),
  sequentialNumber: VinPartSchema.describe("Sequential Production Number (Digits 12-17)."),
  fullVin: z.string().describe("The full VIN that was decoded."),
});
export type DecodeVinOutput = z.infer<typeof DecodeVinOutputSchema>;


// The input schema for the AI prompt, containing the pre-parsed VIN parts.
const DecodeVinPromptInputSchema = z.object({
  wmi: z.string().describe("World Manufacturer Identifier (Digits 1-3)."),
  vds: z.object({
    full: z.string().describe("The full VDS string (Digits 4-8)."),
    trailerType: z.string().describe("Trailer Type Code (Digit 4)."),
    bodyType: z.string().describe("Body Type Code (Digit 5)."),
    bodyLength: z.string().describe("Body Length Code (Digits 6-7)."),
    numberOfAxles: z.string().describe("Number of Axles Code (Digit 8)."),
  }),
  checkDigit: z.string().describe("Check Digit (Digit 9)."),
  modelYear: z.string().describe("Model Year Code (Digit 10)."),
  plant: z.string().describe("Plant Code (Digit 11)."),
  sequentialNumber: z.string().describe("Sequential Production Number (Digits 12-17)."),
  fullVin: z.string().describe("The full 17-digit VIN."),
});
type DecodeVinPromptInput = z.infer<typeof DecodeVinPromptInputSchema>;

const decodeVinFlow = ai.defineFlow(
  {
    name: 'decodeVinFlow',
    inputSchema: DecodeVinSchema,
    outputSchema: DecodeVinOutputSchema,
  },
  async (input) => {
    // Step 1: Deterministically parse the VIN in code.
    const vin = input.vin.toUpperCase();
    const promptInput: DecodeVinPromptInput = {
      wmi: vin.substring(0, 3),
      vds: {
        full: vin.substring(3, 8),
        trailerType: vin.substring(3, 4),
        bodyType: vin.substring(4, 5),
        bodyLength: vin.substring(5, 7),
        numberOfAxles: vin.substring(7, 8),
      },
      checkDigit: vin.substring(8, 9),
      modelYear: vin.substring(9, 10),
      plant: vin.substring(10, 11),
      sequentialNumber: vin.substring(11, 17),
      fullVin: vin,
    };

    // Step 2: Ask the AI to provide descriptions for the parsed components.
    const { output } = await prompt(promptInput);
    
    // Step 3: Validate the AI's output.
    if (!output || !output.wmi?.value || !output.fullVin?.trim() || output.fullVin !== vin) {
      const errorMessage = 'AI failed to generate a valid description for the VIN. The output was empty, incomplete, or mismatched the original VIN. Please ensure the VIN is valid and try again.';
      console.error(errorMessage, { input, promptInput, receivedOutput: output });
      throw new Error(errorMessage);
    }
    
    return output;
  }
);

// Wrap the core flow logic with the authentication utility
export const decodeVin = createAuthenticatedFlow(decodeVinFlow);

const prompt = ai.definePrompt({
  name: 'decodeVinPrompt',
  input: {schema: DecodeVinPromptInputSchema},
  output: {schema: DecodeVinOutputSchema},
  prompt: `You are an expert VIN (Vehicle Identification Number) decoder for trailers.
Your task is to take pre-parsed VIN components and assemble them into a structured JSON output with descriptions.

Provided VIN: {{{fullVin}}}
- WMI: {{{wmi}}}
- VDS (Full): {{{vds.full}}}
- Trailer Type Code: {{{vds.trailerType}}}
- Body Type Code: {{{vds.bodyType}}}
- Body Length Code: {{{vds.bodyLength}}}
- Number of Axles Code: {{{vds.numberOfAxles}}}
- Check Digit: {{{checkDigit}}}
- Model Year Code: {{{modelYear}}}
- Plant Code: {{{plant}}}
- Sequential Number: {{{sequentialNumber}}}

Based on this, generate a JSON response that matches the required output schema.
1.  For each section (wmi, checkDigit, modelYear, plant, sequentialNumber), populate its 'value' field with the corresponding code provided above and write a 'description' explaining what that part of the VIN represents.
    - For 'checkDigit', state that it's a calculated value for validation.
    - For 'sequentialNumber', mention the different rules for small (<1000 units/year) vs. large manufacturers.
2.  For the 'vehicleDescriptors' section:
    - Populate its 'value' field with '{{{vds.full}}}'.
    - Populate the specific fields 'trailerType', 'bodyType', 'bodyLength', and 'numberOfAxles' with human-readable descriptions based on their respective codes.
    - Provide a general description for the whole Vehicle Descriptor Section.
3.  The 'fullVin' field in your output MUST be '{{{fullVin}}}'.
4.  Do not invent or hallucinate information not derivable from the provided codes. Your analysis should be based solely on the positional information.
`,
  config: {
    safetySettings: defaultSafetySettings,
  },
});
