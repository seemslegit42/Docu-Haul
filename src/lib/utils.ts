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


/**
 * Converts a numeric value in kilopascals (KPA) to pounds per square inch (PSI).
 * @param kpa The value in KPA.
 * @returns The converted value in PSI, rounded to the nearest whole number.
 */
export function convertKpaToPsi(kpa: number): number {
  return Math.round(kpa / 6.89476);
}

/**
 * Formats a pressure string (assumed to be in KPA) into a bilingual format.
 * e.g., "690" -> "690 KPA (100 PSI / LPC)"
 * @param kpaString The pressure as a string, expected to be a numeric value.
 * @returns A formatted string with both KPA and PSI values. Returns a placeholder if input is invalid.
 */
export function formatPressureBilingual(kpaString: string | undefined): string {
  if (!kpaString || kpaString.trim() === '' || kpaString.includes('[PLACEHOLDER]')) {
    return 'KPA ( PSI / LPC)';
  }
  
  const kpa = parseFloat(kpaString);

  if (isNaN(kpa)) {
    return `${kpaString} KPA ( PSI / LPC)`;
  }
  
  const psi = convertKpaToPsi(kpa);
  return `${kpa} KPA (${psi} PSI / LPC)`;
}
