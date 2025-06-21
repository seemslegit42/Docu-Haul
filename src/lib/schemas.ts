
import { z } from 'zod';
import { DOCUMENT_TYPES } from './constants';

// Schema for Smart Docs (NVIS / Bill of Sale)
export const SmartDocsSchema = z.object({
  documentType: z.nativeEnum(DOCUMENT_TYPES, { required_error: "Document type is required." }),
  vin: z.string().length(17, { message: "VIN must be exactly 17 characters long." }),
  trailerSpecs: z.string().min(10, { message: "Details must be at least 10 characters long." }),
  tone: z.string().optional(),
});
export type SmartDocsInput = z.infer<typeof SmartDocsSchema>;

// Schema for Label Forge (VIN Label Generation)
export const LabelForgeSchema = z.object({
  template: z.enum(['standard', 'bilingual_canadian', 'bilingual_rv_canadian'], {
    required_error: 'A label template must be selected.',
  }),
  vinData: z.string().length(17, { message: "VIN must be exactly 17 characters long." }),
  trailerSpecs: z.string().min(1, { message: "Trailer specifications are required." }),
  regulatoryStandards: z.string().optional(),
  labelDimensions: z.string().min(3, { message: "Label dimensions are required (e.g., 100x50mm)." }),
});
export type LabelForgeInput = z.infer<typeof LabelForgeSchema>;

// Schema for Compliance Check
export const ComplianceCheckSchema = z.object({
  documentType: z.string().min(1, { message: "Document type is required." }),
  documentContent: z.string().min(10, { message: "Document content must be at least 10 characters long." }),
  targetRegulations: z.string().min(1, { message: "Target regulations are required." }),
  countryOfOperation: z.string().min(1, { message: "Country of operation is required." }),
});
export type ComplianceCheckInput = z.infer<typeof ComplianceCheckSchema>;

// Schema for VIN Decoder
export const DecodeVinSchema = z.object({
    vin: z.string().length(17, { message: "VIN must be exactly 17 characters long." }),
});
export type DecodeVinInput = z.infer<typeof DecodeVinSchema>;
