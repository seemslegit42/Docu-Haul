
/**
 * @fileOverview Utilities for handling Vehicle Identification Numbers (VINs).
 */

const TRANSLITERATION: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '0': 0,
};

const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

// Maps the 10th character of a VIN to its corresponding model year.
// This mapping covers the years 2001-2030. It assumes modern vehicles for simplicity.
const VIN_YEAR_MAP: Record<string, string> = {
  '1': '2001', '2': '2002', '3': '2003', '4': '2004', '5': '2005', '6': '2006', '7': '2007', '8': '2008', '9': '2009',
  A: '2010', B: '2011', C: '2012', D: '2013', E: '2014', F: '2015', G: '2016', H: '2017',
  J: '2018', K: '2019', L: '2020', M: '2021', N: '2022', P: '2023', R: '2024', S: '2025',
  T: '2026', V: '2027', W: '2028', X: '2029', Y: '2030',
};


/**
 * Validates a 17-character VIN using its check digit.
 * @param vin The 17-character VIN string.
 * @returns True if the VIN is valid, false otherwise.
 */
export function validateVin(vin: string): boolean {
  if (vin.length !== 17) {
    return false;
  }

  vin = vin.toUpperCase();
  const providedCheckDigit = vin[8];
  
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = vin[i];
    const value = TRANSLITERATION[char];
    const weight = WEIGHTS[i];

    if (value === undefined) {
      // Invalid character in VIN (I, O, Q are not allowed)
      return false;
    }
    
    // Position 9 (index 8) is the check digit itself, its weight is 0.
    sum += value * weight;
  }

  const remainder = sum % 11;
  const calculatedCheckDigit = remainder === 10 ? 'X' : String(remainder);

  return providedCheckDigit === calculatedCheckDigit;
}

/**
 * Decodes the model year from a 17-character VIN.
 * Assumes a modern vehicle (2001-2030).
 * @param vin The 17-character VIN string.
 * @returns The decoded model year as a string (e.g., "2024"), or "Unknown Year" if not found.
 */
export function decodeModelYear(vin: string): string {
    if (vin.length !== 17) {
        return "Unknown Year";
    }
    const yearCode = vin[9].toUpperCase();
    return VIN_YEAR_MAP[yearCode] || "Unknown Year";
}
