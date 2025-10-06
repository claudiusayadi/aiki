/**
 * Slugifies a given text.
 * @param text The text to be slugified.
 * @returns A URL-friendly slug version of the input text.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple preceding or trailing dashes with a single dash
}
