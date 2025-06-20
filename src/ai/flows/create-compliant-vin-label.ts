
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
1.  'formattedLabelText': The complete, well-structured text content for the VIN label, intended for direct rendering onto an image. Format with newlines (\\n) for clarity.
    -   Always include the full 'VIN: {{{vinData}}}'.
    -   From '{{{trailerSpecs}}}', extract and clearly label information such as:
        -   Manufacturer (e.g., "MANUFACTURER: Trailer Builders Inc.")
        -   Date of Manufacture (e.g., "DATE OF MANUF.: MM/YYYY")
        -   GVWR (Gross Vehicle Weight Rating, e.g., "GVWR: 10000 KG / 22046 LBS")
        -   GAWR (Gross Axle Weight Rating) for each axle (e.g., "GAWR FRONT: 5000 KG / 11023 LBS", "GAWR REAR: 5000 KG / 11023 LBS")
        -   Tire Size (e.g., "TIRE: ST235/80R16G")
        -   Rim Size (e.g., "RIM: 16X6J")
        -   Cold Tire Pressure (e.g., "PSI: 80 COLD")
    -   If any of the above standard pieces of information (Manufacturer, Date of Manuf., GVWR, GAWRs, Tire, Rim, PSI) are not found or inferable from '{{{trailerSpecs}}}', YOU MUST include them with a clear placeholder value, e.g., "MANUFACTURER: [MANUFACTURER NAME]", "DATE OF MANUF.: [MM/YYYY]", "GVWR: [VALUE]", "GAWR FRONT: [VALUE]", "TIRE: [SIZE]", etc. Do not omit these standard fields.
    -   If '{{{regulatoryStandards}}}' is provided, include a compliance statement like "COMPLIES WITH: {{{regulatoryStandards}}}". Otherwise, use "THIS VEHICLE CONFORMS TO ALL APPLICABLE U.S. FEDERAL MOTOR VEHICLE SAFETY STANDARDS (FMVSS) AND CANADIAN MOTOR VEHICLE SAFETY STANDARDS (CMVSS) IN EFFECT ON THE DATE OF MANUFACTURE SHOWN ABOVE." if no specific region is clear, or tailor to the region if implied.
    -   Ensure the text is concise, highly legible, and suitable for a physical label of dimensions {{{labelDimensions}}}.
    -   The output should be ONLY the formatted text content.

2.  'placementRationale': A brief explanation of your choices for the content selection, information hierarchy, and formatting, highlighting how it ensures clarity, includes necessary information, and considers compliance aspects. Focus on why the chosen text and structure are optimal.

Example of a complete 'formattedLabelText', assuming some data is provided and some is placeholder:
"VIN: {{{vinData}}}
MANUFACTURER: [MANUFACTURER NAME]
DATE OF MANUF.: 07/2024
GVWR: 14000 LBS
GAWR FRONT: 7000 LBS WITH ST235/80R16E TIRES AT 80 PSI COLD
GAWR REAR: 7000 LBS WITH ST235/80R16E TIRES AT 80 PSI COLD
RIM: 16X6JJ
THIS VEHICLE CONFORMS TO ALL APPLICABLE U.S. FEDERAL MOTOR VEHICLE SAFETY STANDARDS IN EFFECT ON THE DATE OF MANUFACTURE SHOWN ABOVE."

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
    if (!designOutput || !designOutput.formattedLabelText || !designOutput.placementRationale) {
      throw new Error('AI failed to design the label text. Please check your input or try again.');
    }
    const { formattedLabelText, placementRationale } = designOutput;

    // Step 2: Generate the label image using the designed text
    const imagePrompt = `Generate a clear, professional, and compliant VIN label image.
The label background should be white, and the text should be black for maximum contrast and legibility, unless specific instructions in the provided text suggest otherwise (e.g., "metallic label background").
The label dimensions are approximately ${input.labelDimensions}.
The label MUST display EXACTLY the following text, arranged logically for a standard VIN label, ensuring all information is clear and readable:

${formattedLabelText}

The style must be utilitarian, official, and highly legible, suitable for vehicle identification. Avoid artistic fonts or embellishments.
The label shape should be rectangular.
If the text mentions "barcode" or implies its necessity, include a realistic placeholder for a barcode area (e.g., a blank rectangular area or a generic barcode pattern). Otherwise, do not include a barcode.`;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: imagePrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
         safetySettings: [ // Added safety settings to reduce potential blocking for official document content
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }, // Adjusted for potentially sensitive but necessary compliance terms
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      },
    });

    if (!media || !media.url) {
      throw new Error('AI failed to generate the label image. Please try again.');
    }
    const labelDataUri = media.url;

    return {
      labelDataUri,
      placementRationale,
    };
  }
);
