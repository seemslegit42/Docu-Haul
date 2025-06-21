
'use server';
/**
 * @fileOverview Flow to create compliant VIN labels. This flow uses an AI tool to first validate the VIN, then extracts structured key-value data from the user's input.
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

// Tool for VIN validation
const validateVinTool = ai.defineTool(
  {
    name: 'validateVinTool',
    description: 'Validates a 17-character Vehicle Identification Number (VIN) using its check digit.',
    inputSchema: z.object({ vin: z.string().describe('The 17-character VIN to validate.') }),
    outputSchema: z.boolean(),
  },
  async (input) => {
    return validateVin(input.vin);
  }
);

// Updated schema to include validation result
export const VinLabelDataSchema = z.object({
  isVinValid: z.boolean().describe("The result from validateVinTool. True if the VIN is valid, false otherwise."),
  labelData: z.record(z.string()).describe("A JSON object where keys are the label field names (e.g., 'VIN', 'GVWR') and values are the extracted data. This should be an empty object if the VIN is invalid."),
  placementRationale: z.string().describe("The AI's rationale. If the VIN is invalid, this should explain that the process was stopped."),
});
export type VinLabelData = z.infer<typeof VinLabelDataSchema>;


const createCompliantVinLabelFlow = ai.defineFlow(
  {
    name: 'createCompliantVinLabelFlow',
    inputSchema: LabelForgeSchema,
    outputSchema: VinLabelDataSchema,
  },
  async (input) => {
    // Step 1: Call the prompt with the validation tool.
    const { output } = await vinLabelDesignPrompt(input);
    if (!output) {
      const errorMessage = 'AI failed to process the label request. The output was empty. Please check your input or try again.';
      console.error(errorMessage, { input, receivedOutput: output });
      throw new Error(errorMessage);
    }
    
    // Step 2: Check the explicit validation flag from the AI.
    if (!output.isVinValid) {
        throw new Error('Invalid VIN. The provided VIN failed validation. Please check the number and try again.');
    }

    // Step 3: Ensure label data was actually generated for the valid VIN.
    if (Object.keys(output.labelData).length === 0) {
        const errorMessage = 'AI failed to extract label data for a valid VIN. Please check your input specifications or try again.';
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
  tools: [validateVinTool], // Make the tool available to the AI
  prompt: `You are an expert system for designing compliant VIN (Vehicle Identification Number) labels. Your process is very strict.

**CRITICAL INSTRUCTION:** Your first and most important task is to use the \`validateVinTool\` to check if the provided \`vinData\` is valid.
- You MUST call this tool for every request.
- The result of this tool call MUST be set in the 'isVinValid' field of your response.

**If the VIN is INVALID (\`isVinValid\` is false):**
- You MUST STOP immediately.
- The 'labelData' field MUST be an empty JSON object ({}).
- The 'placementRationale' field MUST state that the VIN is invalid and that no data was extracted.
- Do not proceed to the data extraction task.

**If the VIN is VALID (\`isVinValid\` is true):**
- Proceed to the data extraction task below.

**TASK: Extract Structured Label Data**
Based on the selected template, extract all necessary information and return it as a JSON object in the 'labelData' field.
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

**RATIONALE:**
Explain your choices for the data extraction in the 'placementRationale' field. If the VIN was valid, describe what you found and what placeholders you had to use.

Respond ONLY with a JSON object matching the output schema.
`,
  config: {
    safetySettings: defaultSafetySettings,
  },
});
