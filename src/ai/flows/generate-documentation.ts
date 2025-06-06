
// src/ai/flows/generate-documentation.ts
'use server';
/**
 * @fileOverview A flow for generating vehicle documentation (NVIS or Bill of Sale) from VIN and other specifications.
 *
 * - generateDocumentation - A function that generates the documentation.
 * - GenerateDocumentationInput - The input type for the generateDocumentation function.
 * - GenerateDocumentationOutput - The return type for the generateDocumentation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDocumentationInputSchema = z.object({
  vin: z.string().describe('The Vehicle Identification Number.'),
  trailerSpecs: z.string().describe('The trailer specifications, or buyer/seller/price details for a Bill of Sale.'),
  documentType: z.enum(['NVIS', 'BillOfSale']).describe('The type of document to generate: NVIS or Bill of Sale.'),
});
export type GenerateDocumentationInput = z.infer<typeof GenerateDocumentationInputSchema>;

const GenerateDocumentationOutputSchema = z.object({
  documentText: z.string().describe('The generated vehicle documentation text.'),
});
export type GenerateDocumentationOutput = z.infer<typeof GenerateDocumentationOutputSchema>;

export async function generateDocumentation(input: GenerateDocumentationInput): Promise<GenerateDocumentationOutput> {
  return generateDocumentationFlow(input);
}

const nvisPrompt = ai.definePrompt({
  name: 'generateNVISPrompt',
  input: {schema: GenerateDocumentationInputSchema},
  output: {schema: GenerateDocumentationOutputSchema},
  prompt: `You are an expert in generating New Vehicle Information Statements (NVIS) for trailers.
Your task is to create a complete and accurate NVIS document text.

Use the following information:
VIN: {{{vin}}}
Trailer Specifications: {{{trailerSpecs}}}

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
- Date of Manufacture
- Certification Statement: A statement confirming the vehicle conforms to all applicable safety standards (e.g., FMVSS/CMVSS) in effect on the date of manufacture.
- Space for Seller/Dealer Signature and Date
- Space for Purchaser Signature and Date

Extract as much information as possible from the provided '{{{trailerSpecs}}}'. If critical information (like Manufacturer, Model, Year, GVWR, GAWR) is missing or not inferable, use clear placeholders like "[Manufacturer Name]", "[Model]", "[YYYY]", "[GVWR Value]", etc.
Format the document logically with clear headings and line breaks for readability. The output should be plain text.
Ensure the final document is suitable for official use.
`,
});

const billOfSalePrompt = ai.definePrompt({
  name: 'generateBillOfSalePrompt',
  input: {schema: GenerateDocumentationInputSchema},
  output: {schema: GenerateDocumentationOutputSchema},
  prompt: `You are an expert in drafting Bills of Sale for vehicles/trailers.
Your task is to create a comprehensive Bill of Sale document text.

Use the following information:
VIN: {{{vin}}}
Transaction & Vehicle Details: {{{trailerSpecs}}}

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

Extract buyer, seller, price, and specific vehicle details from '{{{trailerSpecs}}}'. If any critical information is missing (e.g., Seller Name, Buyer Name, Sale Price, Date of Sale), use clear placeholders like "[Seller Full Name]", "[Buyer Full Name]", "[Sale Price]", "[Date of Sale]", etc.
Format the document logically with clear headings and line breaks for readability. The output should be plain text.
Ensure the final document is suitable for a legal transfer of ownership.
`,
});


const generateDocumentationFlow = ai.defineFlow(
  {
    name: 'generateDocumentationFlow',
    inputSchema: GenerateDocumentationInputSchema,
    outputSchema: GenerateDocumentationOutputSchema,
  },
  async (input) => {
    let promptToUse;
    if (input.documentType === 'NVIS') {
      promptToUse = nvisPrompt;
    } else if (input.documentType === 'BillOfSale') {
      promptToUse = billOfSalePrompt;
    } else {
      throw new Error(`Unsupported document type: ${input.documentType}`);
    }

    const {output} = await promptToUse(input);
    
    if (!output || !output.documentText) {
      throw new Error(`AI failed to generate the ${input.documentType} document. Please check your input or try again.`);
    }
    return output;
  }
);

