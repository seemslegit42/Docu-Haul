import { config } from 'dotenv';
config();

import '@/ai/flows/generate-documentation.ts';
import '@/ai/flows/create-compliant-vin-label.ts';