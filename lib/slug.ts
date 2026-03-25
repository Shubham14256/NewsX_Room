/**
 * Generates a URL-safe slug from any input string.
 *
 * Strategy:
 * - ASCII titles  → lowercase, spaces→hyphens, strip punctuation
 * - Unicode/Marathi/Devanagari titles → preserve Unicode chars, spaces→hyphens
 * - Fallback: if result is still empty (e.g. pure symbols), use a timestamp
 */
export function slugify(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  // Normalize unicode (NFC) and lowercase ASCII
  const normalized = trimmed.normalize("NFC").toLowerCase();

  const slug = normalized
    // Replace whitespace runs with a single hyphen
    .replace(/\s+/g, "-")
    // Remove characters that are NOT: letters (any script), digits, hyphens
    // \p{L} = any Unicode letter, \p{N} = any Unicode number
    .replace(/[^\p{L}\p{N}-]/gu, "")
    // Collapse multiple hyphens
    .replace(/-+/g, "-")
    // Strip leading/trailing hyphens
    .replace(/^-+|-+$/g, "");

  // Safety fallback — never return an empty slug
  return slug || `post-${Date.now()}`;
}
