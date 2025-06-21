import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Converts a numeric value in kilograms to pounds.
 * @param kg The value in kilograms.
 * @returns The converted value in pounds, rounded to the nearest whole number.
 */
export function convertKgToLbs(kg: number): number {
  return Math.round(kg * 2.20462);
}

/**
 * Formats a weight string (assumed to be in KG) into a bilingual format.
 * e.g., "7000" -> "7000 KG (15432 LB)"
 * @param kgString The weight as a string, expected to be a numeric value.
 * @returns A formatted string with both KG and LB values. Returns a placeholder if input is invalid.
 */
export function formatWeightBilingual(kgString: string | undefined): string {
  // Return a placeholder if the string is empty or not provided
  if (!kgString || kgString.trim() === '' || kgString.includes('[PLACEHOLDER]')) {
    return ' KG ( LB)';
  }
  
  const kg = parseFloat(kgString);

  // If parsing fails, return the original string with placeholder units
  if (isNaN(kg)) {
    return `${kgString} KG ( LB)`;
  }
  
  const lbs = convertKgToLbs(kg);
  return `${kg} KG (${lbs} LB)`;
}
