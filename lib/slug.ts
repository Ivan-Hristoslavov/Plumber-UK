/**
 * The services table has no slug column, so URLs are derived from the name.
 * Kept here so the route, the sitemap and any linking component all agree.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
