/**
 * Format an ISO date string (e.g. "2026-11-30T00:00:00.000Z")
 * into "2026-11-30 00:00:00" format.
 * Returns the original value if it's not a valid date string.
 */
export const fmtDT = (val: string | null | undefined): string => {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
};

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Return today's date as "YYYY-MM-DD" using the LOCAL timezone. */
export const localDateStr = (date?: Date): string => {
  const d = date || new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

/**
 * Extract the date-only portion from any value that the DB may return
 * (ISO string like "2026-07-23T00:00:00.000Z", plain "2026-07-23", etc.)
 * and return it as "YYYY-MM-DD" in the LOCAL timezone.
 */
export const dbDateStr = (val: string | null | undefined): string => {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

/** Check if a DB date string falls on the given local date (default: today). */
export const isSameLocalDate = (dbDate: string | null | undefined, targetDate?: string): boolean => {
  return dbDateStr(dbDate) === (targetDate ?? localDateStr());
};
