
// src/ai/flows/create-compliant-vin-label.ts
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
import admin from '@/lib/firebase-admin';

const CreateCompliantVinLabelOutputSchema = z.object({
  labelDataUri: z.string().describe('The data URI of the generated VIN label image.'),
  placementRationale: z.string().describe('The AI\'s rationale for the information placement on the label.'),
  labelTextContent: z.string().describe('The formatted text content used to generate the label image.'),
});
export type CreateCompliantVinLabelOutput = z.infer<typeof CreateCompliantVinLabelOutputSchema>;

// A structured representation of the data to be placed on the VIN label.
const StructuredVinLabelDataSchema = z.object({
    manufacturer: z.string().describe("Manufacturer name. Use placeholder '[MANUFACTURER NAME]' if not provided."),
    dateOfManufacture: z.string().describe("Date of manufacture (e.g., 'MM/YYYY'). Use placeholder '[MM/YYYY]' if not provided."),
    gvwr: z.string().describe("Gross Vehicle Weight Rating (e.g., '14000 LBS'). Use placeholder '[GVWR VALUE]' if not provided."),
    gawr: z.array(z.string()).describe("An array of Gross Axle Weight Ratings, one string per axle (e.g., ['GAWR FRONT: 7000 LBS WITH ...', 'GAWR REAR: 7000 LBS WITH ...']). Use placeholders if not provided."),
    tireSpec: z.string().optional().describe("Tire specifications if not included in GAWR strings (e.g., 'ST235/80R16E')."),
    rimSpec: z.string().optional().describe("Rim specifications if not included in GAWR strings (e.g., '16X6JJ')."),
    psi: z.string().optional().describe("Cold tire pressure if not included in GAWR strings (e.g., '80 PSI COLD')."),
    complianceStatement: z.string().describe("A regulatory compliance statement. Generate an appropriate default if standards are not provided."),
  });

// Intermediate schema for the AI to extract structured data and provide a rationale.
const VinLabelDesignSchema = z.object({
  extractedData: StructuredVinLabelDataSchema.describe("The structured data extracted from user input, with placeholders for missing values."),
  placementRationale: z.string().describe("The AI's rationale for the data extraction and content selection."),
});

// Prompt for designing label content and rationale
const vinLabelDesignPrompt = ai.definePrompt({
  name: 'vinLabelDesignPrompt',
  input: {schema: LabelForgeSchema},
  output: {schema: VinLabelDesignSchema},
  prompt: `You are an expert in designing compliant VIN (Vehicle Identification Number) labels.
Your task is to extract structured data from the user's input and provide a rationale for your choices.

Consider the following inputs:
- VIN: {{{vinData}}}
- Trailer Specifications: {{{trailerSpecs}}}
- Regulatory Standards (if any): {{{regulatoryStandards}}}
- Label Dimensions: {{{labelDimensions}}}

Based on these inputs, populate the 'extractedData' object with the following information:
-   From '{{{trailerSpecs}}}', extract the Manufacturer, Date of Manufacture (in MM/YYYY format), GVWR, GAWR for each axle (including tire/rim/psi info in the string), and standalone Tire/Rim/PSI specs if they are not part of the GAWR.
-   If any of this standard information is NOT FOUND, you MUST use a clear placeholder in the corresponding field: '[MANUFACTURER NAME]', '[MM/YYYY]', '[GVWR VALUE]', '[GAWR VALUE]', etc. DO NOT OMIT any fields in the schema.
-   For 'complianceStatement': If '{{{regulatoryStandards}}}' is provided, use it. Otherwise, generate a default statement like "THIS VEHICLE CONFORMS TO ALL APPLICABLE U.S. FEDERAL MOTOR VEHICLE SAFETY STANDARDS (FMVSS) AND CANADIAN MOTOR VEHICLE SAFETY STANDARDS (CMVSS) IN EFFECT ON THE DATE OF MANUFACTURE SHOWN ABOVE."

Also, provide a 'placementRationale' explaining your choices for the content selection and data extraction.
`,
  config: {
    safetySettings: defaultSafetySettings,
  },
});

export async function createCompliantVinLabel(input: LabelForgeInput, authToken: string | undefined): Promise<CreateCompliantVinLabelOutput> {
  // SERVER-SIDE AUTH CHECK: This is a critical security step.
  if (!authToken) {
    throw new Error('Authentication required. Access denied.');
  }

  // Check if the admin SDK was initialized. If not, the server is not configured for premium checks.
  if (!admin.apps.length) {
    console.error("Firebase Admin SDK is not initialized. Cannot perform premium user check.");
    throw new Error("Server authentication is not configured. Please contact support.");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(authToken);
    const isPremium = decodedToken.premium === true;

    if (!isPremium) {
      throw new Error('This is a premium feature. Please upgrade your plan to generate VIN labels.');
    }

    // If authorized, proceed with the AI flow.
    return await createCompliantVinLabelFlow(input);

  } catch (error: any) {
    console.error('Authorization check failed in createCompliantVinLabel:', error);
    // Re-throw a generic error to avoid leaking implementation details to the client.
    throw new Error('You are not authorized to perform this action. Please check your subscription status and try again.');
  }
}

const createCompliantVinLabelFlow = ai.defineFlow(
  {
    name: 'createCompliantVinLabelFlow',
    inputSchema: LabelForgeSchema,
    outputSchema: CreateCompliantVinLabelOutputSchema,
  },
  async (input) => {
    // Step 1: Generate structured label data and rationale
    const { output: designOutput } = await vinLabelDesignPrompt(input);
    if (!designOutput || !designOutput.extractedData || !designOutput.placementRationale?.trim()) {
      const errorMessage = 'AI failed to design the label data. The output was empty or incomplete. Please check your input or try again.';
      console.error(errorMessage, { input, receivedOutput: designOutput });
      throw new Error(errorMessage);
    }
    const { extractedData, placementRationale } = designOutput;

    // Step 2: Programmatically build the label text from structured data for consistency
    const labelLines = [
        `VIN: ${input.vinData}`,
        `MANUFACTURER: ${extractedData.manufacturer}`,
        `DATE OF MANUF.: ${extractedData.dateOfManufacture}`,
        `GVWR: ${extractedData.gvwr}`,
        ...extractedData.gawr,
    ];
    if (extractedData.tireSpec) labelLines.push(`TIRE: ${extractedData.tireSpec}`);
    if (extractedData.rimSpec) labelLines.push(`RIM: ${extractedData.rimSpec}`);
    if (extractedData.psi) labelLines.push(`PSI: ${extractedData.psi}`);
    labelLines.push(extractedData.complianceStatement);
    
    const formattedLabelText = labelLines.filter(line => line?.trim()).join('\n');

    // Step 3: Generate the label image using the composed text
    const imagePrompt = `Generate a clear, professional, and compliant VIN label image.
The label background should be white, and the text should be black for maximum contrast and legibility.
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
      labelTextContent: formattedLabelText,
    };
  }
);
