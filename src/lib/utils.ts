import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Wedding dates are stored in MongoDB as Date instants but conceptually
// represent a single calendar day. To prevent timezone shifts (e.g. Aug 8
// becoming Aug 7 in Pacific time), we round-trip everything through UTC.

// Convert a "YYYY-MM-DD" string from the date input into an ISO string fixed
// at noon UTC, so the calendar day is preserved across all reasonable
// timezones when read back.
export function weddingDateInputToISO(yyyymmdd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyymmdd);
  if (!m) return yyyymmdd;
  const [, y, mo, d] = m;
  const iso = new Date(
    Date.UTC(Number(y), Number(mo) - 1, Number(d), 12, 0, 0)
  ).toISOString();
  return iso;
}

// Convert a stored ISO string back to "YYYY-MM-DD" using the UTC date parts,
// so the date input shows the same calendar day the user originally picked.
export function weddingDateInputValue(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Returns a local-time Date object whose calendar day matches the UTC date
// of the given ISO. Use this when formatting wedding dates with date-fns so
// the output shows the intended calendar day in any viewer's timezone.
export function weddingDateForDisplay(iso: string | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
