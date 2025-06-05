import { z } from 'zod';

export const SmartDocsSchema = z.object({
  vin: z.string().length(17, { message: "VIN must be exactly 17 characters long." }),
  trailerSpecs: z.string().min(1, { message: "Trailer specifications are required." }),
});

export type SmartDocsInput = z.infer<typeof SmartDocsSchema>;

export const LabelForgeSchema = z.object({
  vinData: z.string().length(17, { message: "VIN must be exactly 17 characters long." }),
  trailerSpecs: z.string().min(1, { message: "Trailer specifications are required." }),
  regulatoryStandards: z.string().optional(),
  labelDimensions: z.string().min(3, { message: "Label dimensions are required (e.g., 100x50mm)." }),
});

export type LabelForgeInput = z.infer<typeof LabelForgeSchema>;
