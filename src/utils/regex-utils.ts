/**
 * Utility functions for common regular expressions.
 */

/**
 * Checks if a string is a safe JavaScript identifier.
 * A safe identifier starts with a letter, underscore, or dollar sign,
 * and is followed by alphanumeric characters, underscores, or dollar signs.
 *
 * @param value - The string to test.
 * @returns True if the string is a safe identifier, false otherwise.
 */
export function isSafeIdentifier(value: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(value);
}

/**
 * Checks if a string is a valid TypeScript type name.
 * A valid type name starts with an uppercase letter and contains only alphanumeric characters.
 *
 * @param value - The string to test.
 * @returns True if the string is a valid TypeScript type name, false otherwise.
 */
export function isValidTypeName(value: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(value);
}
