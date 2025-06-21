'use server';
/**
 * @fileOverview A flow for generating vehicle documentation (NVIS or Bill of Sale).
 * This flow uses a single, powerful AI prompt to both extract structured data from user input and format the final document text.
 *
 * - generateDocumentation - The primary function to generate documentation.
 * - GenerateDocumentationOutput - The return type for the generateDocumentation function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';
import { type SmartDocsInput, SmartDocsSchema } from '@/lib/schemas';
import { defaultSafetySettings } from '@/ai/safety-settings';
import { createAuthenticatedFlow } from './utils/authWrapper';

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
  structuredData: ExtractedDataSchema.describe('The structured data extracted from the user input, with placeholders for missing information.'),
  documentText: z.string().describe('The final, formatted vehicle documentation text, suitable for display or download.'),
});
export type GenerateDocumentationOutput = z.infer<typeof GenerateDocumentationOutputSchema>;

const generateDocumentationFlow = ai.defineFlow(
  {
    name: 'generateDocumentationFlow',
    inputSchema: SmartDocsSchema,
    outputSchema: GenerateDocumentationOutputSchema,
  },
  async (input) => {
    // Step 1: Call the single, powerful prompt to do both extraction and formatting.
    const { output } = await generateDocumentPrompt(input);

    // Step 2: Validate the output
    if (!output || !output.documentText?.trim() || !output.structuredData) {
        const errorMessage = `AI failed to generate valid documentation for ${input.documentType}. The output was empty or incomplete. Please check your input and try again.`;
        console.error(errorMessage, { input, receivedOutput: output });
        throw new Error(errorMessage);
    }
    
    // Step 3: Return the combined result
    return output;
  }
);

// Wrap the core flow logic with the authentication utility
export const generateDocumentation = createAuthenticatedFlow(generateDocumentationFlow);

// A single, powerful prompt that handles both data extraction and document formatting.
const generateDocumentPrompt = ai.definePrompt({
    name: 'generateDocumentPrompt',
    input: { schema: SmartDocsSchema },
    output: { schema: GenerateDocumentationOutputSchema },
    prompt: `You are an AI assistant specializing in vehicle documentation. Your task is to act as a single, powerful agent that both extracts structured information from provided details AND formats it into a complete, professional document.

**User Inputs:**
- Document Type Requested: {{{documentType}}}
- VIN: {{{vin}}}
- Document Tone: {{#if tone}}{{{tone}}}{{else}}professional and formal{{/if}}
- Provided Details:
"""
{{{trailerSpecs}}}
"""

**Your Task (Two parts, one response):**

**Part 1: Extract Structured Data**
- Based on the 'Document Type Requested', populate all fields of the corresponding 'structuredData' schema (NVIS or Bill of Sale).
- It is crucial that you do not hallucinate or invent values.
- If a required piece of information is not available in the 'Provided Details', you MUST use a clear placeholder in square brackets for that field (e.g., "[Manufacturer Name]", "[Sale Price]", "[YYYY]").
- Do not omit any required fields from the target schema. For the VIN, use the one provided above.

**Part 2: Generate Formatted Document Text**
- Using the data you just extracted (including placeholders), generate the full text for the document in the 'documentText' field.
- The text must be professionally formatted with clear headings, sections, and spacing, suitable for a legal or official document.
- The tone of the document should match the requested 'Document Tone'.

**Formatting Rules based on Document Type:**

{{#if (eq documentType "NVIS")}}
**NVIS Certificate Formatting:**
- Title: NEW VEHICLE INFORMATION STATEMENT (NVIS)
- Sections: MANUFACTURER, VEHICLE DETAILS, SPECIFICATIONS, CERTIFICATION, SIGNATURES.
- Key fields to include: Manufacturer Name/Address, VIN, Make, Model, Year, Body Type, GVWR, GAWR, Axles, Tire/Rim Size, Date of Manufacture, Dimensions.
- Include a standard certification statement about conforming to applicable U.S. and Canadian safety standards.
- Include signature lines for Seller/Dealer and Purchaser.
{{/if}}

{{#if (eq documentType "BillOfSale")}}
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
