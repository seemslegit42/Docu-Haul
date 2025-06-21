'use server';
/**
 * @fileOverview A flow for decoding a Vehicle Identification Number (VIN). This flow first validates the VIN's check digit, parses it in code, then uses AI to provide human-readable descriptions for each component.
 *
 * - decodeVin - A function that performs the VIN decoding.
 * - DecodeVinOutput - The return type for the decodeVin function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { type DecodeVinInput, DecodeVinSchema } from '@/lib/schemas';
import { defaultSafetySettings } from '@/ai/safety-settings';
import { createAuthenticatedFlow } from './utils/authWrapper';
import { validateVin, decodeModelYear } from '@/lib/vin-utils';

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

// An extended schema for the model year to include the decoded year.
const VinModelYearSchema = VinPartSchema.extend({
    year: z.string().describe("The decoded 4-digit model year."),
});

// The final, structured output for the entire decoded VIN
export const DecodeVinOutputSchema = z.object({
  wmi: VinPartSchema.describe("World Manufacturer Identifier (Digits 1-3)."),
  vehicleDescriptors: VinDescriptorSchema.describe("Vehicle Descriptors (Digits 4-8)."),
  checkDigit: VinPartSchema.describe("Check Digit (Digit 9)."),
  modelYear: VinModelYearSchema.describe("Model Year (Digit 10)."),
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
  modelYear: z.object({
    code: z.string().describe("The single character code for the model year (Digit 10)."),
    year: z.string().describe("The fully decoded 4-digit year.")
  }).describe("Model Year Information"),
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
    const vin = input.vin.toUpperCase();

    // Step 1: Deterministically validate the VIN check digit.
    if (!validateVin(vin)) {
      throw new Error('Invalid VIN. The provided VIN failed the check digit validation. Please verify the number and try again.');
    }

    // Step 2: Deterministically parse the valid VIN in code.
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
      modelYear: {
          code: vin.substring(9, 10),
          year: decodeModelYear(vin),
      },
      plant: vin.substring(10, 11),
      sequentialNumber: vin.substring(11, 17),
      fullVin: vin,
    };

    // Step 3: Ask the AI to provide descriptions for the parsed components.
    const { output } = await prompt(promptInput);
    
    // Step 4: Validate the AI's output.
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
Your task is to take pre-parsed VIN components and assemble them into a structured JSON output with descriptions. The provided VIN has already been validated.

Provided VIN: {{{fullVin}}}
- WMI: {{{wmi}}}
- VDS (Full): {{{vds.full}}}
  - Trailer Type Code: {{{vds.trailerType}}}
  - Body Type Code: {{{vds.bodyType}}}
  - Body Length Code: {{{vds.bodyLength}}}
  - Number of Axles Code: {{{vds.numberOfAxles}}}
- Check Digit: {{{checkDigit}}}
- Model Year Code: {{{modelYear.code}}} (which decodes to {{{modelYear.year}}})
- Plant Code: {{{plant}}}
- Sequential Number: {{{sequentialNumber}}}

Based on this, generate a JSON response that matches the required output schema.
1.  For each section (wmi, checkDigit, modelYear, plant, sequentialNumber), populate its 'value' field with the corresponding code provided above and write a 'description' explaining what that part of the VIN represents.
    - For 'checkDigit', state that it's a calculated value for validation and that it is **valid** for this VIN.
    - For 'modelYear', use the code '{{{modelYear.code}}}' as the value. In the description, explain that this code represents the model year '{{{modelYear.year}}}'. Also populate the 'year' field in the modelYear object with '{{{modelYear.year}}}'.
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
