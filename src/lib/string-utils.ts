
/**
 * @fileOverview General utility functions for string manipulation.
 */

/**
 * Capitalizes the first letter of a given string.
 * @param s The string to capitalize.
 * @returns The capitalized string.
 */
export function capitalize(s: string): string {
  if (typeof s !== 'string' || s.length === 0) {
    return s;
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
}
