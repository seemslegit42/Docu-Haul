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
import { createAuthenticatedFlow } from './utils/authWrapper';

const ComplianceFindingSchema = z.object({
  issue: z.string().describe("A concise description of a single compliance issue or potential concern found in the document."),
  recommendation: z.string().describe("A clear, actionable recommendation to fix the identified issue and achieve compliance."),
  isCritical: z.boolean().describe("A boolean flag indicating if the issue is a critical compliance failure."),
});

const CheckComplianceOutputSchema = z.object({
  complianceStatus: z.string().describe('The compliance status, which must be one of the following exact strings: "Compliant", "Potential Issues", or "Non-Compliant".'),
  summary: z.string().describe('A high-level summary of the overall compliance assessment.'),
  findings: z.array(ComplianceFindingSchema).describe('A list of specific compliance findings. If the document is fully compliant, this array should be empty.'),
});
export type CheckComplianceOutput = z.infer<typeof CheckComplianceOutputSchema>;

const checkComplianceFlow = ai.defineFlow(
  {
    name: 'checkComplianceFlow',
    inputSchema: ComplianceCheckSchema,
    outputSchema: CheckComplianceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    
    const validStatuses = ["Compliant", "Potential Issues", "Non-Compliant"];
    
    // Check for null/undefined output, empty summary, or an invalid status from the AI.
    if (!output || !output.summary?.trim() || !output.complianceStatus || !validStatuses.includes(output.complianceStatus)) {
      const errorMessage = 'AI failed to generate a valid compliance report. The output was empty, incomplete, or contained an invalid status. Please check your input and try again.';
      console.error(errorMessage, { input, receivedOutput: output });
      throw new Error(errorMessage);
    }
    
    return output;
  }
);

// Wrap the core flow logic with the authentication utility, requiring a premium claim.
export const checkCompliance = createAuthenticatedFlow(checkComplianceFlow, {
    premiumRequired: true,
    premiumCheckError: 'The Compliance Checker is a premium feature. Please upgrade your plan to validate documents.'
});

const prompt = ai.definePrompt({
  name: 'checkCompliancePrompt',
  input: {schema: ComplianceCheckSchema},
  output: {schema: CheckComplianceOutputSchema},
  prompt: `You are an AI compliance expert specializing in transportation and vehicle regulations.
Your task is to analyze the provided document content against the specified regulations for the given country of operation and return a structured compliance report in JSON format.

Document Type: {{{documentType}}}
Country of Operation: {{{countryOfOperation}}}
Target Regulations: {{{targetRegulations}}}

Document Content to Analyze:
\`\`\`
{{{documentContent}}}
\`\`\`

Please perform a thorough compliance check and respond ONLY with a JSON object matching the output schema.
1.  Set the 'complianceStatus' to "Compliant", "Potential Issues", or "Non-Compliant".
2.  Write a high-level 'summary' of your findings.
3.  Populate the 'findings' array with specific issues. For each finding:
    - Clearly state the 'issue'.
    - Provide an actionable 'recommendation' to fix it.
    - Set 'isCritical' to true if it represents a major compliance failure, or false for minor issues or suggestions.
4.  If the document is fully compliant, the 'findings' array MUST be empty. Do not add "No issues found" as a finding.
`,
  config: {
    safetySettings: defaultSafetySettings,
  },
});
