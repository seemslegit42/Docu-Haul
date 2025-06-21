'use server';
/**
 * @fileOverview Flow to create compliant VIN labels from provided data, using generative AI to determine content and layout, and then generate an image.
 *
 * - createCompliantVinLabel - A function that handles the VIN label creation process.
 * - CreateCompliantVinLabelOutput - The return type for the createCompliantVinLabel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { type LabelForgeInput, LabelForgeSchema } from '@/lib/schemas';
import { defaultSafetySettings } from '@/ai/safety-settings';
import { createAuthenticatedFlow } from './utils/authWrapper';

const CreateCompliantVinLabelOutputSchema = z.object({
  labelDataUri: z.string().describe('The data URI of the generated VIN label image.'),
  placementRationale: z.string().describe('The AI\'s rationale for the information placement on the label.'),
  labelTextContent: z.string().describe('The formatted text content used to generate the label image.'),
});
export type CreateCompliantVinLabelOutput = z.infer<typeof CreateCompliantVinLabelOutputSchema>;

// Intermediate schema for the AI to extract structured data and provide a rationale.
const VinLabelDesignSchema = z.object({
    labelTextContent: z.string().describe("The complete, formatted text content for the label, ready for image generation. All placeholders for missing data should be included. The formatting should match the selected template style."),
    placementRationale: z.string().describe("The AI's rationale for the data extraction, content selection, and layout decisions based on the user input and selected template."),
});

const createCompliantVinLabelFlow = ai.defineFlow(
  {
    name: 'createCompliantVinLabelFlow',
    inputSchema: LabelForgeSchema,
    outputSchema: CreateCompliantVinLabelOutputSchema,
  },
  async (input) => {
    // Step 1: Generate structured label data and rationale
    const { output: designOutput } = await vinLabelDesignPrompt(input);
    if (!designOutput || !designOutput.labelTextContent?.trim() || !designOutput.placementRationale?.trim()) {
      const errorMessage = 'AI failed to design the label data. The output was empty or incomplete. Please check your input or try again.';
      console.error(errorMessage, { input, receivedOutput: designOutput });
      throw new Error(errorMessage);
    }
    const { labelTextContent, placementRationale } = designOutput;

    // Step 2: Generate the label image using the AI-composed text
    const imagePrompt = `Generate a clear, professional, and compliant VIN label image based on the selected template style.
The label background should be white, and the text should be black for maximum contrast and legibility.
The label dimensions are approximately ${input.labelDimensions}.
The label MUST display EXACTLY the following text content, arranged logically according to the specified template style ('${input.template}').

**Label Content:**
\`\`\`
${labelTextContent}
\`\`\`

The style must be utilitarian, official, and highly legible. Avoid artistic fonts. The label must be a simple rectangle.
For the 'bilingual_canadian' template, ensure the layout mimics the official side-by-side format with checkboxes for SINGLE/DUAL.
For the 'standard' template, use a clean, stacked layout.`;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: imagePrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: defaultSafetySettings,
      },
    });

    if (!media || !media.url) {
      const errorMessage = 'AI failed to generate the label image. This can be an intermittent issue. Please try again.';
      console.error(errorMessage, {
        input,
        designOutput, // Log the intermediate step's output
        imagePrompt,
      });
      throw new Error(errorMessage);
    }
    const labelDataUri = media.url;

    return {
      labelDataUri,
      placementRationale,
      labelTextContent,
    };
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
  output: {schema: VinLabelDesignSchema},
  prompt: `You are an expert in designing compliant VIN (Vehicle Identification Number) labels based on a specified template.
Your task is to create the complete, formatted text content for the label and provide a rationale.

Template Selected: **{{{template}}}**

User Inputs:
- VIN: {{{vinData}}}
- Trailer Specifications: {{{trailerSpecs}}}
- Regulatory Standards (if any): {{{regulatoryStandards}}}

**TASK 1: Generate Formatted Label Text Content**

Based on the selected template, generate the complete text content for the label.
- Carefully parse the user inputs for all necessary information.
- If any required information is missing, you MUST use clear placeholders like '[PLACEHOLDER]'.
- The final text should be formatted exactly as it should appear on the label, including line breaks and spacing.

{{#if (eq template "standard")}}
**Template Style: Standard US**
Generate a standard US-style VIN label text. Include fields for:
- VIN
- MANUFACTURER
- DATE OF MANUF.
- GVWR
- GAWR (for each axle)
- TIRE, RIM, PSI (if available)
- A US/FMVSS compliance statement (use a default if not provided).
{{/if}}

{{#if (eq template "bilingual_canadian")}}
**Template Style: Bilingual Canadian (English/French)**
Generate a bilingual Canadian-style VIN label text. Include bilingual fields for:
- MANUFACTURED BY / FABRIQUE PAR:
- DATE:
- GVWR / PNBV: KG ( LB)
- GAWR (EACH AXLE) / PNBE (CHAQUE ESSIEU): KG ( LB) TIRES / PNEU:
- RIMS / JANTE:
- COLD INFL. PRESS. / PRESS. DE GONFL. A FROID: KPA ( PSI / LPC)
- Checkboxes for SINGLE / DUAL
- V.I.N. / N.I.V.:
- TYPE / TYPE:
- A joint US/Canadian compliance statement (use a default if not provided).
The layout should have English and French terms side-by-side or clearly associated.
{{/if}}

**TASK 2: Provide Rationale**
Explain your choices for the content selection, data extraction, and formatting in the 'placementRationale' field.

Respond ONLY with a JSON object matching the output schema.
`,
  config: {
    safetySettings: defaultSafetySettings,
  },
});
