'use server';
/**
 * @fileOverview Flow to create compliant VIN labels. This flow first validates the VIN in code, then uses an AI prompt to extract structured key-value data from the user's input.
 *
 * - createCompliantVinLabel - A function that handles the VIN label data extraction process.
 * - VinLabelData - The return type for the createCompliantVinLabel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { type LabelForgeInput, LabelForgeSchema } from '@/lib/schemas';
import { defaultSafetySettings } from '@/ai/safety-settings';
import { createAuthenticatedFlow } from './utils/authWrapper';
import { validateVin } from '@/lib/vin-utils';

// Schema for the AI prompt's output. It only focuses on what the AI generates.
const VinLabelDesignOutputSchema = z.object({
  labelData: z.record(z.string()).describe("A JSON object where keys are the label field names (e.g., 'VIN', 'GVWR') and values are the extracted data."),
  placementRationale: z.string().describe("The AI's rationale for the data extraction choices, including any placeholders used."),
});

// The final output schema for the entire flow, including the validation result.
export const VinLabelDataSchema = z.object({
  isVinValid: z.boolean().describe("The result of the VIN validation. True if the VIN is valid, false otherwise."),
  labelData: z.record(z.string()).describe("A JSON object where keys are the label field names (e.g., 'VIN', 'GVWR') and values are the extracted data. This will be an empty object if the VIN is invalid."),
  placementRationale: z.string().describe("The AI's rationale or an explanation that the VIN was invalid."),
});
export type VinLabelData = z.infer<typeof VinLabelDataSchema>;


const createCompliantVinLabelFlow = ai.defineFlow(
  {
    name: 'createCompliantVinLabelFlow',
    inputSchema: LabelForgeSchema,
    outputSchema: VinLabelDataSchema,
  },
  async (input) => {
    // Step 1: Deterministically validate the VIN in code FIRST.
    const isVinValid = validateVin(input.vinData);

    if (!isVinValid) {
        // If the VIN is invalid, return a structured response indicating failure.
        // This is more graceful than throwing an error for a predictable validation failure.
        return {
            isVinValid: false,
            labelData: {},
            placementRationale: 'The provided VIN is invalid. The 17-character number failed the check-digit validation. Please verify the VIN and try again.',
        };
    }

    // Step 2: Since the VIN is valid, call the AI to perform data extraction.
    const { output } = await vinLabelDesignPrompt(input);
    
    // This is an unexpected error. If the VIN is valid, the AI should always be able to extract data.
    if (!output || Object.keys(output.labelData).length === 0) {
        const errorMessage = 'AI failed to extract label data for a valid VIN. Please check your input specifications or try again.';
        console.error(errorMessage, { input, receivedOutput: output });
        throw new Error(errorMessage);
    }
    
    // Step 3: Combine the validation result with the AI's output.
    return {
        isVinValid: true,
        labelData: output.labelData,
        placementRationale: output.placementRationale,
    };
  }
);

// Wrap the core flow logic with the authentication utility, requiring a premium claim.
export const createCompliantVinLabel = createAuthenticatedFlow(createCompliantVinLabelFlow, { 
    premiumRequired: true,
    premiumCheckError: 'The Label Forge is a premium feature. Please upgrade your plan to generate VIN labels.'
});

// Prompt for designing label content and rationale.
// This prompt is now much simpler because it can assume the VIN is already valid.
const vinLabelDesignPrompt = ai.definePrompt({
  name: 'vinLabelDesignPrompt',
  input: {schema: LabelForgeSchema},
  output: {schema: VinLabelDesignOutputSchema},
  prompt: `You are an expert system for designing compliant VIN (Vehicle Identification Number) labels.
The VIN provided has already been validated and is correct. Your task is to extract structured data for the label based on the user's input.

**TASK: Extract Structured Label Data**
Based on the selected template, extract all necessary information from the user's inputs and return it as a JSON object in the 'labelData' field.
- The keys of the JSON object MUST be the official field names as specified below for the chosen template.
- If any required information is not available in the user's input, you MUST use a clear placeholder like '[PLACEHOLDER]'.
- Do not invent or hallucinate information.
- The 'VIN' field must always be populated with the provided VIN.

Template Selected: **{{{template}}}**

User Inputs:
- VIN: {{{vinData}}}
- Trailer Specifications: {{{trailerSpecs}}}
- Regulatory Standards (if any): {{{regulatoryStandards}}}

{{#if (eq template "standard")}}
**Template Style: Standard US**
Extract data for the following keys: "MANUFACTURER", "DATE OF MANUF.", "GVWR", "GAWR", "TIRE", "RIM", "PSI", "VIN", "TYPE", and "COMPLIANCE_STATEMENT". For the compliance statement, use the provided regulatory standard or a default US/FMVSS statement.
{{/if}}

{{#if (eq template "bilingual_canadian")}}
**Template Style: Bilingual Canadian (English/French)**
Extract data for the following keys: "MANUFACTURED BY / FABRIQUE PAR", "DATE", "GVWR / PNBV", "GAWR (EACH AXLE) / PNBE (CHAQUE ESSIEU)", "TIRES / PNEU", "RIMS / JANTE", "COLD INFL. PRESS. / PRESS. DE GONFL. A FROID", "SINGLE_OR_DUAL", "V.I.N. / N.I.V.", "TYPE / TYPE", and "COMPLIANCE_STATEMENT".
- For "GVWR / PNBV" and "GAWR (EACH AXLE) / PNBE (CHAQUE ESSIEU)", extract ONLY the numeric value in kilograms. Do not include units or any other text (e.g., "7000").
- For "COLD INFL. PRESS. / PRESS. DE GONFL. A FROID", extract ONLY the numeric value in KPA (e.g., "690").
- For the "SINGLE_OR_DUAL" key, analyze the tire specifications and return only the string "single" or "dual". Do not include any other text.
- For the compliance statement, use the provided standard or a default US/Canadian statement.
{{/if}}

{{#if (eq template "bilingual_rv_canadian")}}
**Template Style: Bilingual Canadian RV (Tall)**
Extract data for the following keys: "BRAND", "DATE", "RESP_MFR", "GVWR_LBS", "GVWR_KG", "VIN", "SIZE", "FRONT_GAWR_LBS", "FRONT_GAWR_KG", "FRONT_TIRE", "FRONT_RIM", "FRONT_PSI", "FRONT_KPA", "REAR_GAWR_LBS", "REAR_GAWR_KG", "REAR_TIRE", "REAR_RIM", "REAR_PSI", "REAR_KPA", "COMPLIANCE_STATEMENT_VEHICLE", "COMPLIANCE_STATEMENT_TRAILER".
- "BRAND" is the main logo/name at the top (e.g., Jayco).
- "RESP_MFR" is the responsible manufacturer name.
- Extract LBS and KG values for GVWR and GAWRs separately.
- Extract PSI and KPA values separately for front and rear axles.
- "COMPLIANCE_STATEMENT_VEHICLE" is the block of text under the heading "TYPE OF VEHICLE/TYPE DE VÉHICULE".
- "COMPLIANCE_STATEMENT_TRAILER" is the block of text under the heading "TRAILER/REMORQUE".
{{/if}}


**RATIONALE:**
In the 'placementRationale' field, explain your choices for the data extraction. Describe what you found and what placeholders you had to use.

Respond ONLY with a JSON object matching the output schema.
`,
  config: {
    safetySettings: defaultSafetySettings,
  },
});