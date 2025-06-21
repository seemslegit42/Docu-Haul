
// src/ai/flows/generate-documentation.ts
'use server';
/**
 * @fileOverview A flow for generating vehicle documentation (NVIS or Bill of Sale) by first extracting structured data from user input, then formatting it into a document.
 *
 * - generateDocumentation - A function that generates the documentation.
 * - GenerateDocumentationOutput - The return type for the generateDocumentation function.
 */

import {ai}from '@/ai/genkit';
import {z}from 'genkit';
import { DOCUMENT_TYPES } from '@/lib/constants';
import { type SmartDocsInput, SmartDocsSchema } from '@/lib/schemas';
import { defaultSafetySettings } from '@/ai/safety-settings';
import admin from '@/lib/firebase-admin';

// Structured schema for NVIS data
const NvisDataSchema = z.object({
    manufacturerName: z.string().describe("Manufacturer's full legal name. Use placeholder '[Manufacturer Name]' if not provided in the source details."),
    manufacturerAddress: z.string().describe("Manufacturer's full mailing address. Use placeholder '[Manufacturer Address]' if not provided."),
    make: z.string().describe("Vehicle Make, typically the same as the manufacturer. Use placeholder '[Make]' if not provided."),
    model: z.string().describe("Vehicle Model designation. Use placeholder '[Model]' if not provided."),
    year: z.string().describe("Vehicle Model Year (YYYY). Use placeholder '[YYYY]' if not provided."),
    bodyType: z.string().describe("Vehicle Body Type/Style (e.g., Flatbed, Gooseneck, Utility). Use placeholder '[Body Type]' if not provided."),
    gvwr: z.string().describe("Gross Vehicle Weight Rating (e.g., '14000 LBS'). Use placeholder '[GVWR Value]' if not provided."),
    gawr: z.string().describe("Gross Axle Weight Rating (specify for each axle if multiple, e.g., '7000 LBS per axle'). Use placeholder '[GAWR Value]' if not provided."),
    numberOfAxles: z.string().describe("Total number of axles. Use placeholder '[Number of Axles]' if not provided."),
    tireSize: z.string().describe("Tire size specification (e.g., 'ST235/80R16E'). Use placeholder '[Tire Size]' if not provided."),
    rimSize: z.string().describe("Rim size specification (e.g., '16X6JJ'). Use placeholder '[Rim Size]' if not provided."),
    dimensions: z.string().describe("Overall vehicle dimensions (Length, Width, Height). Use placeholder '[Overall Dimensions LWH]' if not provided."),
    dateOfManufacture: z.string().describe("Date of manufacture in MM/YYYY format. Use placeholder '[MM/YYYY]' if not provided."),
});

// Structured schema for Bill of Sale data
const BillOfSaleDataSchema = z.object({
    sellerName: z.string().describe("Seller's full legal name. Use placeholder '[Seller Name]' if not provided."),
    sellerAddress: z.string().describe("Seller's full mailing address. Use placeholder '[Seller Address]' if not provided."),
    buyerName: z.string().describe("Buyer's full legal name. Use placeholder '[Buyer Name]' if not provided."),
    buyerAddress: z.string().describe("Buyer's full mailing address. Use placeholder '[Buyer Address]' if not provided."),
    saleDate: z.string().describe("Date of the transaction. Use placeholder '[Date of Sale]' if not provided."),
    salePrice: z.string().describe("Full sale price including currency (e.g., '$10,000.00 USD'). Use placeholder '[Sale Price]' if not provided."),
    make: z.string().describe("Vehicle Make. Use placeholder '[Make]' if not provided."),
    model: z.string().describe("Vehicle Model. Use placeholder '[Model]' if not provided."),
    year: z.string().describe("Vehicle Model Year (YYYY). Use placeholder '[YYYY]' if not provided."),
    bodyType: z.string().describe("Vehicle Body Type/Style. Use placeholder '[Body Type]' if not provided."),
    color: z.string().optional().describe("Primary vehicle color."),
});

// Union schema for the output of the data extraction prompt
const ExtractedDataSchema = z.union([NvisDataSchema, BillOfSaleDataSchema]);

const GenerateDocumentationOutputSchema = z.object({
  structuredData: ExtractedDataSchema.describe('The structured data extracted from the user input.'),
  documentText: z.string().describe('The final, formatted vehicle documentation text.'),
});
export type GenerateDocumentationOutput = z.infer<typeof GenerateDocumentationOutputSchema>;

export async function generateDocumentation(input: SmartDocsInput, authToken: string | undefined): Promise<GenerateDocumentationOutput> {
  if (!authToken) {
    throw new Error('Authentication required. Access denied.');
  }

  if (!admin.apps.length) {
    console.error("Firebase Admin SDK is not initialized. Cannot perform authenticated check.");
    throw new Error("Server authentication is not configured. Please contact support.");
  }

  try {
    await admin.auth().verifyIdToken(authToken);
    return await generateDocumentationFlow(input);
  } catch (error: any) {
    console.error('Authorization check failed in generateDocumentation:', error);
    throw new Error('You are not authorized to perform this action. Please sign in and try again.');
  }
}

// A single, more powerful prompt for extracting structured data.
const extractDocumentDataPrompt = ai.definePrompt({
    name: 'extractDocumentDataPrompt',
    input: { schema: SmartDocsSchema },
    // The output schema is dynamically chosen in the flow, so we don't specify it here.
    prompt: `You are an AI assistant specializing in vehicle documentation. Your task is to extract structured information from the provided text based on the requested document type.
Adopt the following tone: {{#if tone}}{{{tone}}}{{else}}professional and formal{{/if}}.

Document Type Requested: {{{documentType}}}
VIN: {{{vin}}}
Provided Details:
"""
{{{trailerSpecs}}}
"""

Carefully parse the 'Provided Details' to populate ALL fields of the required schema for the requested document type.
It is crucial that you do not hallucinate or invent values.
If a required piece of information is not available in the 'Provided Details', you MUST use a clear placeholder in square brackets for that field (e.g., "[Manufacturer Name]", "[Sale Price]", "[YYYY]").
Do not omit any fields from the target schema.
For optional fields in the schema (like 'color' in a Bill of Sale), you may omit them if not provided.
`,
    config: {
      safetySettings: defaultSafetySettings,
    },
});

/**
 * Formats the structured NVIS data into a human-readable text document.
 * @param vin - The Vehicle Identification Number.
 * @param data - The structured NVIS data.
 * @returns A formatted string representing the NVIS document.
 */
function formatNvisText(vin: string, data: z.infer<typeof NvisDataSchema>): string {
    return `
NEW VEHICLE INFORMATION STATEMENT (NVIS)
=========================================

MANUFACTURER
-----------------------------------------
Name: ${data.manufacturerName}
Address: ${data.manufacturerAddress}

VEHICLE DETAILS
-----------------------------------------
Vehicle Identification Number (VIN): ${vin}
Make: ${data.make}
Model: ${data.model}
Year: ${data.year}
Body Type/Style: ${data.bodyType}
Date of Manufacture: ${data.dateOfManufacture}
Overall Dimensions (L/W/H): ${data.dimensions}

SPECIFICATIONS
-----------------------------------------
Gross Vehicle Weight Rating (GVWR): ${data.gvwr}
Gross Axle Weight Rating (GAWR): ${data.gawr}
Number of Axles: ${data.numberOfAxles}
Tire Size: ${data.tireSize}
Rim Size: ${data.rimSize}

CERTIFICATION
-----------------------------------------
This vehicle conforms to all applicable U.S. Federal Motor Vehicle Safety Standards (FMVSS) and Canadian Motor Vehicle Safety Standards (CMVSS) in effect on the date of manufacture shown above.

SIGNATURES
-----------------------------------------

Seller/Dealer Signature: _________________________
Date: _________________________


Purchaser Signature: _________________________
Date: _________________________
    `.trim();
}

/**
 * Formats the structured Bill of Sale data into a human-readable text document.
 * @param vin - The Vehicle Identification Number.
 * @param data - The structured Bill of Sale data.
 * @returns A formatted string representing the Bill of Sale document.
 */
function formatBillOfSaleText(vin: string, data: z.infer<typeof BillOfSaleDataSchema>): string {
    return `
BILL OF SALE
============

SELLER INFORMATION
-----------------------------------------
Full Name: ${data.sellerName}
Address: ${data.sellerAddress}

BUYER INFORMATION
-----------------------------------------
Full Name: ${data.buyerName}
Address: ${data.buyerAddress}

VEHICLE/TRAILER INFORMATION
-----------------------------------------
Vehicle Identification Number (VIN): ${vin}
Make: ${data.make}
Model: ${data.model}
Year: ${data.year}
Body Type/Style: ${data.bodyType}
${data.color ? `Color: ${data.color}` : ''}

SALE INFORMATION
-----------------------------------------
Date of Sale: ${data.saleDate}
Sale Price: ${data.salePrice}

TERMS & CONDITIONS
-----------------------------------------
The vehicle is sold in 'as-is' condition, with no warranties expressed or implied.
Odometer Reading (if applicable): [Odometer Reading]

SIGNATURES
-----------------------------------------

Seller's Signature: _________________________
Date: _________________________


Buyer's Signature: _________________________
Date: _________________________


Witness Signature: _________________________
Date: _________________________
    `.trim();
}


const generateDocumentationFlow = ai.defineFlow(
  {
    name: 'generateDocumentationFlow',
    inputSchema: SmartDocsSchema,
    outputSchema: GenerateDocumentationOutputSchema,
  },
  async (input) => {
    // Step 1: Determine which schema to use for data extraction
    const targetSchema = input.documentType === 'NVIS' ? NvisDataSchema : BillOfSaleDataSchema;

    // Step 2: Call the AI to extract structured data
    const { output: structuredData } = await extractDocumentDataPrompt(input, {
        output: { schema: targetSchema },
    });

    if (!structuredData) {
        const errorMessage = `AI failed to extract structured data for ${input.documentType}. The output was empty. Please check your input and try again.`;
        console.error(errorMessage, { input, receivedOutput: structuredData });
        throw new Error(errorMessage);
    }
    
    // Step 3: Format the structured data into a text document
    let documentText: string;
    if (input.documentType === 'NVIS') {
        documentText = formatNvisText(input.vin, structuredData as z.infer<typeof NvisDataSchema>);
    } else {
        documentText = formatBillOfSaleText(input.vin, structuredData as z.infer<typeof BillOfSaleDataSchema>);
    }

    if (!documentText.trim()) {
        const errorMessage = `Failed to format document from structured data for ${input.documentType}.`;
        console.error(errorMessage, { input, structuredData });
        throw new Error(errorMessage);
    }

    // Step 4: Return both the structured data and the formatted text
    return {
        structuredData,
        documentText,
    };
  }
);
