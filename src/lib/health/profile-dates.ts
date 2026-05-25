/** Normalize API / user input to YYYY-MM-DD for `<input type="date">`. */
export function normalizeDateOfBirth(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Full years lived; birthday must have occurred this year (month/day aware). */
export function calculateAge(
  dateOfBirth: string | null | undefined,
  referenceDate: Date = new Date()
): number | null {
  const normalized = normalizeDateOfBirth(dateOfBirth);
  if (!normalized) return null;

  const [year, month, day] = normalized.split("-").map(Number);
  if (!year || !month || !day) return null;

  const birth = new Date(year, month - 1, day);
  if (Number.isNaN(birth.getTime())) return null;

  let age = referenceDate.getFullYear() - birth.getFullYear();
  const monthDiff = referenceDate.getMonth() - birth.getMonth();
  const dayDiff = referenceDate.getDate() - birth.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

export function isMinor(dateOfBirth: string | null | undefined, referenceDate: Date = new Date()) {
  const age = calculateAge(dateOfBirth, referenceDate);
  return age !== null && age < 18;
}
