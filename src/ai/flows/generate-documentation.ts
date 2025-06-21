
// src/ai/flows/generate-documentation.ts
'use server';
/**
 * @fileOverview A flow for generating vehicle documentation (NVIS or Bill of Sale) from VIN and other specifications.
 *
 * - generateDocumentation - A function that generates the documentation.
 * - GenerateDocumentationOutput - The return type for the generateDocumentation function.
 */

import {ai}from '@/ai/genkit';
import {z}from 'genkit';
import { DOCUMENT_TYPES } from '@/lib/constants';
import { type SmartDocsInput, SmartDocsSchema } from '@/lib/schemas';
import { defaultSafetySettings } from '@/ai/safety-settings';

const GenerateDocumentationOutputSchema = z.object({
  documentText: z.string().describe('The generated vehicle documentation text.'),
});
export type GenerateDocumentationOutput = z.infer<typeof GenerateDocumentationOutputSchema>;

export async function generateDocumentation(input: SmartDocsInput): Promise<GenerateDocumentationOutput> {
  return generateDocumentationFlow(input);
}

const nvisPrompt = ai.definePrompt({
  name: 'generateNVISPrompt',
  input: {schema: SmartDocsSchema},
  output: {schema: GenerateDocumentationOutputSchema},
  prompt: `You are an expert in generating New Vehicle Information Statements (NVIS) for trailers.
Your task is to create a complete and accurate NVIS document text.
Adopt the following tone: {{#if tone}}{{{tone}}}{{else}}professional and formal{{/if}}.

Use the following information:
VIN: {{{vin}}}
Trailer Specifications: {{{trailerSpecs}}}

The 'Trailer Specifications' ({{{trailerSpecs}}}) may be a plain text description, a list of key-value pairs (e.g., 'GVWR: 7000 lbs, Axles: 2'), or a JSON formatted string. Parse it carefully to extract all relevant vehicle details.

The NVIS must include at least the following sections and information, clearly labeled:
- Statement: "NEW VEHICLE INFORMATION STATEMENT (NVIS)"
- Manufacturer's Name and Address
- Vehicle Identification Number (VIN): {{{vin}}}
- Make
- Model
- Year
- Body Type/Style
- Gross Vehicle Weight Rating (GVWR)
- Gross Axle Weight Rating (GAWR) - Specify for each axle if multiple
- Number of Axles
- Tire Size
- Rim Size
- Overall Dimensions (Length, Width, Height)
- Date of Manufacture
- Certification Statement: A statement confirming the vehicle conforms to all applicable safety standards (e.g., FMVSS/CMVSS) in effect on the date of manufacture.
- Space for Seller/Dealer Signature and Date
- Space for Purchaser Signature and Date

It is crucial that you do not hallucinate or invent values for any fields.
If specific information for a required field (e.g., VIN, Manufacturer's Name and Address, Make, Model, Year, GVWR, GAWRs, Overall Dimensions LWH, Date of Manufacture) is not found or inferable from the provided 'Trailer Specifications', you MUST use a clear placeholder like "[Manufacturer Name]", "[Model]", "[YYYY]", "[GVWR Value]", "[Overall Dimensions LWH]", "[MM/YYYY for Date of Manuf.]", etc. Do not omit these standard fields.
For purely optional fields not provided, you may omit them. Do not invent information under any circumstances.
Format the document logically with clear headings and line breaks for readability. The output should be plain text.
Ensure the final document is suitable for official use.
`,
  config: {
    safetySettings: defaultSafetySettings,
  },
});

const billOfSalePrompt = ai.definePrompt({
  name: 'generateBillOfSalePrompt',
  input: {schema: SmartDocsSchema},
  output: {schema: GenerateDocumentationOutputSchema},
  prompt: `You are an expert in drafting Bills of Sale for vehicles/trailers.
Your task is to create a comprehensive Bill of Sale document text.
Adopt the following tone: {{#if tone}}{{{tone}}}{{else}}professional and formal{{/if}}.

Use the following information:
VIN: {{{vin}}}
Transaction & Vehicle Details: {{{trailerSpecs}}}

The 'Transaction & Vehicle Details' ({{{trailerSpecs}}}) may be a plain text description, a list of key-value pairs (e.g., 'Seller: John Doe, Price: $5000'), or a JSON formatted string. Parse it carefully to extract buyer, seller, price, date, and specific vehicle details.

The Bill of Sale must include at least the following sections and information, clearly labeled:
- Title: "BILL OF SALE"
- Seller Information:
  - Full Name
  - Address
  - Phone Number (Optional)
- Buyer Information:
  - Full Name
  - Address
  - Phone Number (Optional)
- Vehicle/Trailer Information:
  - Vehicle Identification Number (VIN): {{{vin}}}
  - Make
  - Model
  - Year
  - Body Type/Style
  - Color (Optional)
- Sale Information:
  - Date of Sale
  - Sale Price (e.g., "$10,000.00 USD")
- "As-Is" Clause (Common, but confirm if details suggest otherwise): e.g., "The vehicle is sold in 'as-is' condition, with no warranties expressed or implied."
- Odometer Reading (if applicable, usually for powered vehicles, include placeholder if not in specs: "[Odometer Reading (if applicable)]")
- Signatures:
  - Seller's Signature & Date
  - Buyer's Signature & Date
  - Witness Signature(s) & Date (Optional, include space for one)

It is crucial that you do not hallucinate or invent values.
If critical information (e.g., Seller Full Name, Seller Address, Buyer Full Name, Buyer Address, Sale Price, Date of Sale, VIN, Make, Model, Year) is missing from 'Transaction & Vehicle Details', you MUST use clear placeholders like "[Seller Full Name]", "[Buyer Full Name]", "[Sale Price]", "[Date of Sale]", etc.
For optional fields not provided, you may omit them. Do not invent information under any circumstances.
Format the document logically with clear headings and line breaks for readability. The output should be plain text.
Ensure the final document is suitable for a legal transfer of ownership.
`,
  config: {
    safetySettings: defaultSafetySettings,
  },
});


const generateDocumentationFlow = ai.defineFlow(
  {
    name: 'generateDocumentationFlow',
    inputSchema: SmartDocsSchema,
    outputSchema: GenerateDocumentationOutputSchema,
  },
  async (input) => {
    let promptToUse;
    if (input.documentType === 'NVIS') {
      promptToUse = nvisPrompt;
    } else if (input.documentType === 'BillOfSale') {
      promptToUse = billOfSalePrompt;
    } else {
      // This case should ideally be prevented by the enum in the schema, but as a safeguard:
      throw new Error(`Unsupported document type received: ${input.documentType}`);
    }

    const {output: aiModelOutput} = await promptToUse(input);
    
    // Check for null/undefined output or empty/whitespace-only documentText
    if (!aiModelOutput || !aiModelOutput.documentText?.trim()) {
      const errorMessage = `AI failed to generate a valid document for ${input.documentType}. The output was empty or invalid. Please check your input and try again.`;
      console.error(errorMessage, { input, receivedOutput: aiModelOutput });
      throw new Error(errorMessage);
    }
    
    return aiModelOutput; // Return the successful AI output
  }
);
