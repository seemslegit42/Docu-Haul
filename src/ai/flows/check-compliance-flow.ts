
'use server';
/**
 * @fileOverview A flow for checking document compliance against specified regulations.
 *
 * - checkCompliance - A function that performs the compliance check.
 * - CheckComplianceOutput - The return type for the checkCompliance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { type ComplianceCheckInput, ComplianceCheckSchema } from '@/lib/schemas';
import { defaultSafetySettings } from '@/ai/safety-settings';

const CheckComplianceOutputSchema = z.object({
  complianceStatus: z.string().describe('A concise status of the compliance check (e.g., "Compliant", "Potential Issues Found", "Non-Compliant").'),
  complianceReport: z.string().describe('A detailed report outlining the compliance findings, issues, and recommendations.'),
});
export type CheckComplianceOutput = z.infer<typeof CheckComplianceOutputSchema>;

export async function checkCompliance(input: ComplianceCheckInput): Promise<CheckComplianceOutput> {
  return checkComplianceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkCompliancePrompt',
  input: {schema: ComplianceCheckSchema},
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
    safetySettings: defaultSafetySettings,
  },
});

const checkComplianceFlow = ai.defineFlow(
  {
    name: 'checkComplianceFlow',
    inputSchema: ComplianceCheckSchema,
    outputSchema: CheckComplianceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    
    // Check for null/undefined output or empty/whitespace-only report fields
    if (!output || !output.complianceStatus?.trim() || !output.complianceReport?.trim()) {
      const errorMessage = 'AI failed to generate a valid compliance report. The output was empty or incomplete. Please check your input and try again.';
      console.error(errorMessage, { input, receivedOutput: output });
      throw new Error(errorMessage);
    }
    
    return output;
  }
);
