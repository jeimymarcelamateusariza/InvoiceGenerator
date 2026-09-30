export function parseAndCleanClientIds(input: unknown): string[] {
  if (typeof input !== 'string' && !Array.isArray(input)) {
    return [];
  }

  const rawItems = Array.isArray(input) ? input.join(',') : input;
  const items = rawItems.split(/[,\r\n\s]+/);

  const cleaned = items
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  return Array.from(new Set(cleaned));
}
