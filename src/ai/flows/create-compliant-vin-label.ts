'use server';
/**
 * @fileOverview Flow to create compliant VIN labels. This flow uses AI to extract structured key-value data from the user's input, which is then rendered deterministically on the client.
 *
 * - createCompliantVinLabel - A function that handles the VIN label data extraction process.
 * - VinLabelData - The return type for the createCompliantVinLabel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { type LabelForgeInput, LabelForgeSchema } from '@/lib/schemas';
import { defaultSafetySettings } from '@/ai/safety-settings';
import { createAuthenticatedFlow } from './utils/authWrapper';

export const VinLabelDataSchema = z.object({
  labelData: z.record(z.string()).describe("A JSON object where keys are the label field names (e.g., 'VIN', 'GVWR') and values are the extracted data. Use placeholders for missing data."),
  placementRationale: z.string().describe("The AI's rationale for the data extraction and content selection."),
});
export type VinLabelData = z.infer<typeof VinLabelDataSchema>;


const createCompliantVinLabelFlow = ai.defineFlow(
  {
    name: 'createCompliantVinLabelFlow',
    inputSchema: LabelForgeSchema,
    outputSchema: VinLabelDataSchema,
  },
  async (input) => {
    // Step 1: Generate structured label data and rationale
    const { output } = await vinLabelDesignPrompt(input);
    if (!output || !output.labelData || !output.placementRationale?.trim()) {
      const errorMessage = 'AI failed to design the label data. The output was empty or incomplete. Please check your input or try again.';
      console.error(errorMessage, { input, receivedOutput: output });
      throw new Error(errorMessage);
    }
    
    return output;
  }
);

// Wrap the core flow logic with the authentication utility, requiring a premium claim.
export const createCompliantVinLabel = createAuthenticatedFlow(createCompliantVinLabelFlow, { 
    premiumRequired: true,
    premiumCheckError: 'This is a premium feature. Please upgrade your plan to generate VIN labels.'
});

// Prompt for designing label content and rationale
const vinLabelDesignPrompt = ai.definePrompt({
  name: 'vinLabelDesignPrompt',
  input: {schema: LabelForgeSchema},
  output: {schema: VinLabelDataSchema},
  prompt: `You are an expert in designing compliant VIN (Vehicle Identification Number) labels based on a specified template.
Your task is to extract key-value data for the label from the user's input and provide a rationale for your choices.

Template Selected: **{{{template}}}**

User Inputs:
- VIN: {{{vinData}}}
- Trailer Specifications: {{{trailerSpecs}}}
- Regulatory Standards (if any): {{{regulatoryStandards}}}

**TASK 1: Extract Structured Label Data**

Based on the selected template, extract all necessary information and return it as a JSON object in the 'labelData' field.
- The keys of the JSON object MUST be the official field names as specified below for the chosen template.
- If any required information is not available in the user's input, you MUST use a clear placeholder like '[PLACEHOLDER]'.
- Do not invent or hallucinate information.
- The 'VIN' field must always be populated with the provided VIN.

{{#if (eq template "standard")}}
**Template Style: Standard US**
Extract data for the following keys: "MANUFACTURER", "DATE OF MANUF.", "GVWR", "GAWR", "TIRE", "RIM", "PSI", "VIN", "TYPE", and "COMPLIANCE_STATEMENT". For the compliance statement, use the provided regulatory standard or a default US/FMVSS statement.
{{/if}}

{{#if (eq template "bilingual_canadian")}}
**Template Style: Bilingual Canadian (English/French)**
Extract data for the following keys: "MANUFACTURED BY / FABRIQUE PAR", "DATE", "GVWR / PNBV", "GAWR (EACH AXLE) / PNBE (CHAQUE ESSIEU)", "TIRES / PNEU", "RIMS / JANTE", "COLD INFL. PRESS. / PRESS. DE GONFL. A FROID", "SINGLE_OR_DUAL", "V.I.N. / N.I.V.", "TYPE / TYPE", and "COMPLIANCE_STATEMENT". For the compliance statement, use the provided standard or a default US/Canadian statement. For the "SINGLE_OR_DUAL" key, return only the string "single" or "dual" based on the specs.
{{/if}}

**TASK 2: Provide Rationale**
Explain your choices for the data extraction in the 'placementRationale' field. Describe what you found and what placeholders you had to use.

Respond ONLY with a JSON object matching the output schema.
`,
  config: {
    safetySettings: defaultSafetySettings,
  },
});
