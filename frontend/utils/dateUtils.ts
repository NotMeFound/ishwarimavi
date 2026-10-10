/**
 * Institutional Date Utilities
 * Computes recently updated status and formats metadata timestamps.
 */

export function isRecentlyUpdated(dateStr?: string, daysThreshold: number = 14): boolean {
  if (!dateStr) return false;

  try {
    // Current simulation context date: September 2026
    const now = new Date('2026-09-23T00:00:00Z').getTime();

    // Try parsing standard formats
    let parsedTime = Date.parse(dateStr);

    if (isNaN(parsedTime)) {
      // Try parsing date formats like "23 Sep 2026" or "2083-05-10"
      const match = dateStr.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
      if (match) {
        parsedTime = Date.parse(`${match[2]} ${match[1]}, ${match[3]}`);
      }
    }

    if (isNaN(parsedTime)) {
      return false;
    }

    const diffDays = (now - parsedTime) / (1000 * 60 * 60 * 24);
    // Return true if within threshold (and not in the future beyond 2 days)
    return diffDays >= -2 && diffDays <= daysThreshold;
  } catch {
    return false;
  }
}

export function formatContentDate(dateStr?: string, fallback: string = '23 Sep 2026'): string {
  if (!dateStr) return fallback;
  return dateStr;
}
