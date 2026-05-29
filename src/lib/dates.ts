const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})/;
const DAY_FIRST_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

const ISO_DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse YYYY-MM-DD (and Date values) in local time — avoids UTC day shifts. */
export function parseLocalDate(date: string | Date): Date {
  if (date instanceof Date) return date;

  const trimmed = date.trim();

  // Date-only ISO: keep local calendar day (no UTC midnight shift).
  const dateOnlyMatch = trimmed.match(ISO_DATE_ONLY_RE);
  if (dateOnlyMatch) {
    return new Date(
      Number(dateOnlyMatch[1]),
      Number(dateOnlyMatch[2]) - 1,
      Number(dateOnlyMatch[3])
    );
  }

  // Full ISO datetime (e.g. 2026-07-30T10:00:00.000Z): preserve time in local timezone.
  if (trimmed.includes("T") || /\d:\d{2}/.test(trimmed)) {
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const dayFirst = parseDayFirstInputToIso(date);
  if (dayFirst) {
    const [year, month, day] = dayFirst.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(date);
  return parsed;
}

/** Parse YYYY-MM-DD into day/month/year parts (no leading zeros required in UI). */
export function parseIsoDateParts(iso: string | null | undefined) {
  const match = (iso ?? "").match(ISO_DATE_RE);
  if (!match) return { day: "", month: "", year: "" };

  return {
    day: String(Number(match[3])),
    month: String(Number(match[2])),
    year: match[1],
  };
}

/** Build YYYY-MM-DD from separate day, month, year fields. */
export function buildIsoFromParts(day: string, month: string, year: string): string {
  const trimmedDay = day.trim();
  const trimmedMonth = month.trim();
  const trimmedYear = year.trim();
  if (!trimmedDay || !trimmedMonth || !trimmedYear) return "";

  return parseDayFirstInputToIso(`${trimmedDay}/${trimmedMonth}/${trimmedYear}`);
}

/** Display ISO date as DD/MM/YYYY. */
export function formatIsoToDayFirstDisplay(iso: string | null | undefined): string {
  if (!iso) return "";

  const match = iso.match(ISO_DATE_RE);
  if (!match) return "";

  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/** Parse DD/MM/YYYY (or D/M/YYYY) into YYYY-MM-DD. */
export function parseDayFirstInputToIso(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const match = trimmed.match(DAY_FIRST_RE);
  if (!match) return "";

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1000) {
    return "";
  }

  const candidate = new Date(year, month - 1, day);
  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return "";
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatDayFirstDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function isoToTimeValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function combineIsoDateAndTime(isoDate: string, time: string): string | null {
  const match = isoDate.match(ISO_DATE_RE);
  if (!match) return null;

  const timeMatch = time.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);

  if (hours > 23 || minutes > 59) return null;

  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

export function combineDayFirstDateAndTime(dateInput: string, time: string): string | null {
  const isoDate = parseDayFirstInputToIso(dateInput);
  if (!isoDate) return null;

  const timeMatch = time.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) return null;

  const [year, month, day] = isoDate.split("-").map(Number);
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);

  if (hours > 23 || minutes > 59) return null;

  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

export function isoToLocalDateOnly(iso: string): string {
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return "";

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isoToDayFirstDateAndTime(iso: string): { date: string; time: string } {
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) {
    return { date: "", time: "" };
  }

  return {
    date: formatDayFirstDate(value),
    time: isoToTimeValue(iso),
  };
}
