
'use server';
/**
 * @fileOverview An agentic flow for generating vehicle documentation (NVIS or Bill of Sale).
 * This flow uses an AI prompt with a tool to look up vehicle information by VIN, then generates the document.
 *
 * - generateDocumentation - The primary function to generate documentation.
 * - GenerateDocumentationOutput - The return type for the generateDocumentation function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';
import { type SmartDocsInput, SmartDocsSchema } from '@/lib/schemas';
import { defaultSafetySettings } from '@/ai/safety-settings';
import { createAuthenticatedFlow } from './utils/authWrapper';
import { decodeModelYear } from '@/lib/vin-utils';

// Tool Definition: Looks up vehicle information by its VIN.
// In a production system, this could be connected to an external vehicle data API.
const getVehicleInfoByVin = ai.defineTool(
  {
    name: 'getVehicleInfoByVin',
    description: 'Returns detailed vehicle specifications for a given VIN. Use this tool to get the primary information for the vehicle.',
    inputSchema: z.object({ vin: z.string().describe('The 17-character Vehicle Identification Number.') }),
    outputSchema: z.object({
      make: z.string().describe("The manufacturer's brand name."),
      model: z.string().describe('The specific model of the vehicle.'),
      year: z.string().describe('The model year of the vehicle.'),
      bodyType: z.string().describe('The style of the vehicle body (e.g., "Flatbed Trailer").'),
      gvwr: z.string().describe("The Gross Vehicle Weight Rating in pounds (e.g., '14000 LBS')."),
      numberOfAxles: z.string().describe("The number of axles on the vehicle."),
      tireSize: z.string().describe("The tire specification (e.g., 'ST235/80R16E')."),
    }),
  },
  async ({ vin }) => {
    console.log(`[Tool] Looking up VIN specifications for: ${vin}`);
    
    // Decode the year from the VIN to provide more accurate data.
    const decodedYear = decodeModelYear(vin);

    // This data serves as a baseline. The AI is instructed to prioritize user-provided details.
    return {
      make: 'NorthStar Trailers',
      model: 'Gooseneck Pro',
      year: decodedYear,
      bodyType: 'Gooseneck Trailer',
      gvwr: '15000 LBS',
      numberOfAxles: '2',
      tireSize: 'ST235/85R16G',
    };
  }
);


// Structured schema for NVIS data with detailed descriptions to guide AI extraction.
const NvisDataSchema = z.object({
    manufacturerName: z.string().describe("Manufacturer's full legal name. Extract from details, or use placeholder '[Manufacturer Name]' if not provided."),
    manufacturerAddress: z.string().describe("Manufacturer's full mailing address. Extract from details, or use placeholder '[Manufacturer Address]' if not provided."),
    make: z.string().describe("Vehicle Make, typically the same as the manufacturer. Extract from details, or use placeholder '[Make]' if not provided."),
    model: z.string().describe("Vehicle Model designation. Extract from details, or use placeholder '[Model]' if not provided."),
    year: z.string().describe("Vehicle Model Year (YYYY). Extract from details, or use placeholder '[YYYY]' if not provided."),
    bodyType: z.string().describe("Vehicle Body Type/Style (e.g., Flatbed, Gooseneck, Utility). Extract from details, or use placeholder '[Body Type]' if not provided."),
    gvwr: z.string().describe("Gross Vehicle Weight Rating (e.g., '14000 LBS'). Extract from details, or use placeholder '[GVWR Value]' if not provided."),
    gawr: z.string().describe("Gross Axle Weight Rating (specify for each axle if multiple, e.g., '7000 LBS per axle'). Extract from details, or use placeholder '[GAWR Value]' if not provided."),
    numberOfAxles: z.string().describe("Total number of axles. Extract from details, or use placeholder '[Number of Axles]' if not provided."),
    tireSize: z.string().describe("Tire size specification (e.g., 'ST235/80R16E'). Extract from details, or use placeholder '[Tire Size]' if not provided."),
    rimSize: z.string().describe("Rim size specification (e.g., '16X6JJ'). Extract from details, or use placeholder '[Rim Size]' if not provided."),
    dimensions: z.string().describe("Overall vehicle dimensions (Length, Width, Height). Extract from details, or use placeholder '[Overall Dimensions LWH]' if not provided."),
    dateOfManufacture: z.string().describe("Date of manufacture in MM/YYYY format. Extract from details, or use placeholder '[MM/YYYY]' if not provided."),
});

// Structured schema for Bill of Sale data with detailed descriptions.
const BillOfSaleDataSchema = z.object({
    sellerName: z.string().describe("Seller's full legal name. Extract from details, or use placeholder '[Seller Name]' if not provided."),
    sellerAddress: z.string().describe("Seller's full mailing address. Extract from details, or use placeholder '[Seller Address]' if not provided."),
    buyerName: z.string().describe("Buyer's full legal name. Extract from details, or use placeholder '[Buyer Name]' if not provided."),
    buyerAddress: z.string().describe("Buyer's full mailing address. Extract from details, or use placeholder '[Buyer Address]' if not provided."),
    saleDate: z.string().describe("Date of the transaction. Extract from details, or use placeholder '[Date of Sale]' if not provided."),
    salePrice: z.string().describe("Full sale price including currency (e.g., '$10,000.00 USD'). Extract from details, or use placeholder '[Sale Price]' if not provided."),
    make: z.string().describe("Vehicle Make. Extract from details, or use placeholder '[Make]' if not provided."),
    model: z.string().describe("Vehicle Model. Extract from details, or use placeholder '[Model]' if not provided."),
    year: z.string().describe("Vehicle Model Year (YYYY). Extract from details, or use placeholder '[YYYY]' if not provided."),
    bodyType: z.string().describe("Vehicle Body Type/Style. Extract from details, or use placeholder '[Body Type]' if not provided."),
    color: z.string().optional().describe("Primary vehicle color. Extract from details if available."),
});

// Union schema for the extracted data part of the output
const ExtractedDataSchema = z.union([NvisDataSchema, BillOfSaleDataSchema]);

// The final output schema for the entire generation process
const GenerateDocumentationOutputSchema = z.object({
  structuredData: ExtractedDataSchema.describe('The structured data extracted from the user input and tool output, with placeholders for missing information.'),
  documentText: z.string().describe('The final, formatted vehicle documentation text, suitable for display or download.'),
});
export type GenerateDocumentationOutput = z.infer<typeof GenerateDocumentationOutputSchema>;

// Create a schema for the prompt's input, extending the base schema with boolean flags.
// This makes the prompt logic simpler and more robust.
const GenerateDocumentPromptSchema = SmartDocsSchema.extend({
    isNVIS: z.boolean(),
    isBillOfSale: z.boolean(),
});

const generateDocumentationFlow = ai.defineFlow(
  {
    name: 'generateDocumentationFlow',
    inputSchema: SmartDocsSchema,
    outputSchema: GenerateDocumentationOutputSchema,
  },
  async (input) => {
    // Prepare the input for the prompt, adding boolean flags for the document type
    // to avoid using non-standard Handlebars helpers.
    const promptInput = {
        ...input,
        isNVIS: input.documentType === 'NVIS',
        isBillOfSale: input.documentType === 'BillOfSale',
    };

    // Step 1: Call the single, powerful prompt to do both extraction and formatting.
    const { output } = await generateDocumentPrompt(promptInput);

    // Step 2: Validate the basic output structure
    if (!output || !output.documentText?.trim() || !output.structuredData) {
        const errorMessage = `AI failed to generate valid documentation for ${input.documentType}. The output was empty or incomplete. Please check your input and try again.`;
        console.error(errorMessage, { input, receivedOutput: output });
        throw new Error(errorMessage);
    }
    
    // Step 3: Perform strict validation on the structuredData against the expected schema.
    // This ensures the AI has returned all required fields for the document type.
    try {
      if (input.documentType === 'NVIS') {
        NvisDataSchema.parse(output.structuredData);
      } else if (input.documentType === 'BillOfSale') {
        BillOfSaleDataSchema.parse(output.structuredData);
      }
    } catch (e) {
      const errorMessage = `AI failed to generate a valid structured document. The output data did not match the required format. Please try again.`;
      console.error(errorMessage, { zodError: e, input, receivedOutput: output });
      throw new Error(errorMessage);
    }

    // Step 4: Return the validated result
    return output;
  }
);

// Wrap the core flow logic with the authentication utility, requiring a premium claim.
export const generateDocumentation = createAuthenticatedFlow(generateDocumentationFlow, {
    premiumRequired: true,
    premiumCheckError: 'Smart Docs is a premium feature. Please upgrade your plan to generate documents.'
});

// A single, powerful prompt that handles both data extraction and document formatting.
const generateDocumentPrompt = ai.definePrompt({
    name: 'generateDocumentPrompt',
    input: { schema: GenerateDocumentPromptSchema },
    output: { schema: GenerateDocumentationOutputSchema },
    tools: [getVehicleInfoByVin],
    prompt: `You are an AI agent specializing in vehicle documentation. Your primary goal is to generate a complete and accurate document (either NVIS or Bill of Sale) for the user, even if some information sources are unavailable.

**Your Agentic Process:**

1.  **Attempt Tool Use**: First, ATTEMPT to use the 'getVehicleInfoByVin' tool to retrieve base specifications for the provided VIN: '{{{vin}}}'.
2.  **Handle Tool Results Gracefully**:
    *   **If the tool succeeds**: Use the data from the tool as your primary source of vehicle information.
    *   **If the tool fails or returns an error**: Do not stop. Acknowledge the failure and proceed using only the user's text. The user's input is now your ONLY source of vehicle data.
3.  **Incorporate User Details**: Analyze the user's 'Provided Details' below. This text contains supplemental information (e.g., buyer/seller info) AND may contain vehicle specifications. If the tool succeeded, these details should OVERRIDE the tool's data. If the tool failed, this is your primary source for ALL vehicle data.
4.  **Synthesize and Extract**: Combine all available information. Populate ALL fields of the required structuredData schema (NVIS or Bill of Sale). If any information is still missing after checking all sources, you MUST use a clear placeholder in square brackets (e.g., "[Manufacturer Address]", "[Sale Price]"). Do not omit any required fields.
5.  **Generate Final Document**: Using the complete, synthesized data from the previous step, generate the final, professionally formatted text for the document in the 'documentText' field. The tone must match the requested 'Document Tone'.

**User Inputs:**
- Document Type Requested: {{{documentType}}}
- VIN: {{{vin}}}
- Document Tone: {{#if tone}}{{{tone}}}{{else}}professional and formal{{/if}}
- Provided Details:
"""
{{{trailerSpecs}}}
"""

**Formatting Rules based on Document Type:**

{{#if isNVIS}}
**NVIS Certificate Formatting:**
- Title: NEW VEHICLE INFORMATION STATEMENT (NVIS)
- Sections: MANUFACTURER, VEHICLE DETAILS, SPECIFICATIONS, CERTIFICATION, SIGNATURES.
- Key fields to include: Manufacturer Name/Address, VIN, Make, Model, Year, Body Type, GVWR, GAWR, Axles, Tire/Rim Size, Date of Manufacture, Dimensions.
- Include a standard certification statement about conforming to applicable U.S. and Canadian safety standards.
- Include signature lines for Seller/Dealer and Purchaser.
{{/if}}

{{#if isBillOfSale}}
**Bill of Sale Formatting:**
- Title: BILL OF SALE
- Sections: SELLER INFORMATION, BUYER INFORMATION, VEHICLE/TRAILER INFORMATION, SALE INFORMATION, TERMS & CONDITIONS, SIGNATURES.
- Key fields to include: Seller/Buyer Name/Address, VIN, Make, Model, Year, Body Type, Color (if available), Sale Date, Sale Price.
- Include a standard 'as-is' condition clause.
- Include an optional Odometer Reading field with a placeholder.
- Include signature lines for Seller, Buyer, and a Witness.
{{/if}}

Respond ONLY with a single JSON object that perfectly matches the required output schema, containing both the 'structuredData' and the 'documentText'.`,
    config: {
      safetySettings: defaultSafetySettings,
    },
});
