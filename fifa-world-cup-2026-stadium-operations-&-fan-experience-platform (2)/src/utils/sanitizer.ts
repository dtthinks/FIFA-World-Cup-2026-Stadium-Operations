/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Sanitizes a raw input string to prevent XSS injection attacks by escaping HTML metacharacters.
 * 
 * @param input - The untrusted string to sanitize.
 * @returns A safe, escaped string.
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Safely parses any text as JSON with error boundaries and fallback value.
 * 
 * @param text - The raw string to parse.
 * @param fallback - The fallback value if parsing fails.
 * @returns The parsed object or fallback.
 */
export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    console.error("JSON parsing failed, returning fallback:", e);
    return fallback;
  }
}
