const slugifyRegex = /[^a-z0-9]+/gi;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(slugifyRegex, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
