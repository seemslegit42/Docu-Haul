
'use server';
/**
 * @fileOverview A flow for checking document compliance against specified regulations.
 *
 * - checkCompliance - A function that performs the compliance check.
 * - CheckComplianceInput - The input type for the checkCompliance function.
 * - CheckComplianceOutput - The return type for the checkCompliance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { CheckComplianceInput } from '@/lib/schemas';
import { CheckComplianceInputSchema } from '@/lib/schemas';

// Re-exporting the schema type for clarity in this context.
export type { CheckComplianceInput };

const CheckComplianceOutputSchema = z.object({
  complianceStatus: z.string().describe('A concise status of the compliance check (e.g., "Compliant", "Potential Issues Found", "Non-Compliant").'),
  complianceReport: z.string().describe('A detailed report outlining the compliance findings, issues, and recommendations.'),
});
export type CheckComplianceOutput = z.infer<typeof CheckComplianceOutputSchema>;

export async function checkCompliance(input: CheckComplianceInput): Promise<CheckComplianceOutput> {
  return checkComplianceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkCompliancePrompt',
  input: {schema: CheckComplianceInputSchema},
  output: {schema: CheckComplianceOutputSchema},
  prompt: `You are an AI compliance expert specializing in transportation and vehicle regulations.
Your task is to analyze the provided document content against the specified regulations for the given country of operation.

Document Type: {{{documentType}}}
Country of Operation: {{{countryOfOperation}}}
Target Regulations: {{{targetRegulations}}}

Document Content to Analyze:
\`\`\`
{{{documentContent}}}
\`\`\`

Please perform a thorough compliance check and provide:
1.  A 'complianceStatus' (e.g., "Compliant", "Potential Issues Found", "Non-Compliant").
2.  A detailed 'complianceReport' that includes:
    - An overall assessment summary.
    - A list of any identified compliance issues or areas of concern. For each issue, briefly explain why it's a concern in relation to the target regulations.
    - Specific recommendations for addressing any identified issues to achieve compliance.
    - If compliant, confirm and highlight key compliant aspects.

Structure your report clearly. Be precise and refer to general regulatory principles if specific clauses are not known, but emphasize the {{{targetRegulations}}}.
If the document content is insufficient for a full check, state that in the report.
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  },
});

const checkComplianceFlow = ai.defineFlow(
  {
    name: 'checkComplianceFlow',
    inputSchema: CheckComplianceInputSchema,
    outputSchema: CheckComplianceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      console.error('Compliance check AI model returned null output.', {input});
      throw new Error('Compliance check failed: The AI model did not produce an output.');
    }
    if (!output.complianceStatus || !output.complianceReport) {
      console.error('Compliance check AI model output is missing required fields.', {input, output});
      throw new Error('Compliance check failed: The AI model output is incomplete.');
    }
    return output;
  }
);
