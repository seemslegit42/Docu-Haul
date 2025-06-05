// src/ai/flows/create-compliant-vin-label.ts
'use server';
/**
 * @fileOverview Flow to create compliant VIN labels from provided data, using generative AI to determine content and layout, and then generate an image.
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
  labelDimensions: z.string().describe('Label dimensions like width and height (e.g., "100mm x 50mm", "4in x 2in").'),
});
export type CreateCompliantVinLabelInput = z.infer<typeof CreateCompliantVinLabelInputSchema>;

const CreateCompliantVinLabelOutputSchema = z.object({
  labelDataUri: z.string().describe('The data URI of the generated VIN label image.'),
  placementRationale: z.string().describe('The AI\'s rationale for the information placement on the label.'),
});
export type CreateCompliantVinLabelOutput = z.infer<typeof CreateCompliantVinLabelOutputSchema>;

// Intermediate schema for text content design
const VinLabelDesignSchema = z.object({
  formattedLabelText: z.string().describe(
    "The complete text content for the VIN label, formatted with newlines for basic structure. " +
    "This text will be used to generate the label image. " +
    "Include all necessary information like VIN, GVWR, Axle Count, Tire Size, Manufacturer, etc., based on input. " +
    "Example: 'VIN: {VIN}\\nGVWR: {GVWR} kg\\nAXLE 1: {AXLE1_RATING} kg ...'"
  ),
  placementRationale: z.string().describe('The AI\'s rationale for the information placement and content selection.'),
});

// Prompt for designing label content and rationale
const vinLabelDesignPrompt = ai.definePrompt({
  name: 'vinLabelDesignPrompt',
  input: {schema: CreateCompliantVinLabelInputSchema},
  output: {schema: VinLabelDesignSchema},
  prompt: `You are an expert in designing compliant VIN (Vehicle Identification Number) labels.
Your task is to determine the optimal text content and its formatting for a VIN label, and provide a rationale.

Consider the following inputs:
- VIN Data: {{{vinData}}}
- Trailer Specifications: {{{trailerSpecs}}}
- Regulatory Standards (if any): {{{regulatoryStandards}}}
- Label Dimensions: {{{labelDimensions}}}

Based on these inputs, generate:
1.  'formattedLabelText': The complete text content for the VIN label. This text should be formatted with newlines (\\n) to suggest a basic structure. Include all critical information derived from the inputs, such as the full VIN, key trailer specifications (like GVWR, GAWR, tire size, rim size, manufacturing date if inferable or standard), and manufacturer name if deducible or a placeholder. The text should be clear, concise, and suitable for a physical label.
2.  'placementRationale': A brief explanation of your choices for the content and formatting, highlighting how it ensures clarity, includes necessary information, and considers compliance aspects.

Example for 'formattedLabelText' (adapt based on actual input):
"VIN: {{{vinData}}}
Manufacturer: [Specify Manufacturer or "Trailer Corp Inc."]
Date of Manufacture: [Specify MM/YYYY or "01/2024"]
GVWR: [Specify Gross Vehicle Weight Rating from specs]
GAWR FRONT: [Specify Gross Axle Weight Rating - Front from specs]
GAWR REAR: [Specify Gross Axle Weight Rating - Rear from specs]
TIRE SIZE: [Specify Tire Size from specs]
RIM SIZE: [Specify Rim Size from specs]
COMPLIES WITH: [Mention {{{regulatoryStandards}}} if provided, or "Applicable Federal Motor Vehicle Safety Standards"]"

Ensure the 'formattedLabelText' is ready to be placed onto an image.
Focus on textual content and its logical structure. The actual visual rendering into an image will be a subsequent step.`,
});

export async function createCompliantVinLabel(input: CreateCompliantVinLabelInput): Promise<CreateCompliantVinLabelOutput> {
  return createCompliantVinLabelFlow(input);
}

const createCompliantVinLabelFlow = ai.defineFlow(
  {
    name: 'createCompliantVinLabelFlow',
    inputSchema: CreateCompliantVinLabelInputSchema,
    outputSchema: CreateCompliantVinLabelOutputSchema,
  },
  async (input) => {
    // Step 1: Generate label text content and rationale
    const { output: designOutput } = await vinLabelDesignPrompt(input);
    if (!designOutput) {
      throw new Error('Failed to generate label design content.');
    }
    const { formattedLabelText, placementRationale } = designOutput;

    // Step 2: Generate the label image using the designed text
    const imagePrompt = \`Generate a clear, professional, and compliant VIN label image.
The label dimensions are approximately \${input.labelDimensions}.
The label MUST display the following text, arranged for maximum legibility and adherence to typical VIN label standards:

\${formattedLabelText}

Ensure the image is high-contrast (e.g., black text on a white or light metallic background if not specified otherwise) and suitable for official vehicle identification purposes.
The style should be utilitarian and official, not artistic. Prefer a rectangular label.
Include a placeholder for a barcode if commonly found on such labels, or if suggested by the text.\`;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: imagePrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed to produce an image.');
    }
    const labelDataUri = media.url;

    return {
      labelDataUri,
      placementRationale,
    };
  }
);
