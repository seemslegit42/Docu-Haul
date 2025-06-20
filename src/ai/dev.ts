
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-documentation.ts';
import '@/ai/flows/create-compliant-vin-label.ts';
import '@/ai/flows/check-compliance-flow.ts';
import '@/ai/flows/decode-vin-flow.ts';
