const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})/;
const DAY_FIRST_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

/** Parse YYYY-MM-DD (and Date values) in local time — avoids UTC day shifts. */
export function parseLocalDate(date: string | Date): Date {
  if (date instanceof Date) return date;

  const isoMatch = date.match(ISO_DATE_RE);
  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
  }

  const dayFirst = parseDayFirstInputToIso(date);
  if (dayFirst) {
    const [year, month, day] = dayFirst.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(date);
  return parsed;
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
