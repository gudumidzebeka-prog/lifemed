export type TrackerType =
  | "blood-pressure"
  | "pulse"
  | "sleep"
  | "weight"
  | "glucose"
  | "water";

export interface TrackerEntry {
  id: string;
  type: TrackerType;
  value: number;
  valueSecondary?: number;
  note?: string;
  recordedAt: string;
}

const STORAGE_KEY = "lifemed-tracker-entries";

export function loadTrackerEntries(): TrackerEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TrackerEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTrackerEntries(entries: TrackerEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addTrackerEntry(
  entry: Omit<TrackerEntry, "id" | "recordedAt"> & { recordedAt?: string }
): TrackerEntry {
  const next: TrackerEntry = {
    ...entry,
    id: `tr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    recordedAt: entry.recordedAt ?? new Date().toISOString(),
  };
  const entries = [next, ...loadTrackerEntries()].slice(0, 500);
  saveTrackerEntries(entries);
  return next;
}

export function updateTrackerEntry(
  id: string,
  patch: Partial<Omit<TrackerEntry, "id">>
): TrackerEntry | null {
  const entries = loadTrackerEntries();
  const index = entries.findIndex((entry) => entry.id === id);
  if (index === -1) return null;

  entries[index] = { ...entries[index], ...patch };
  saveTrackerEntries(entries);
  return entries[index];
}

export function deleteTrackerEntry(id: string): boolean {
  const entries = loadTrackerEntries();
  const next = entries.filter((entry) => entry.id !== id);
  if (next.length === entries.length) return false;
  saveTrackerEntries(next);
  return true;
}

export function formatTrackerValue(
  entry: TrackerEntry,
  formatBloodPressureUnit: string,
  formatUnit: (type: TrackerType) => string
) {
  if (entry.type === "blood-pressure" && entry.valueSecondary) {
    return `${entry.value}/${entry.valueSecondary} ${formatBloodPressureUnit}`;
  }
  return `${entry.value} ${formatUnit(entry.type)}`;
}

export function getTrackerEntriesByType(type: TrackerType, limit = 14) {
  return loadTrackerEntries()
    .filter((entry) => entry.type === type)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
    .slice(0, limit);
}

export function hasLoggedTrackerToday(type?: TrackerType) {
  const today = new Date().toISOString().slice(0, 10);
  return loadTrackerEntries().some((entry) => {
    if (type && entry.type !== type) return false;
    return entry.recordedAt.slice(0, 10) === today;
  });
}

export const TRACKER_TYPES: TrackerType[] = [
  "blood-pressure",
  "pulse",
  "sleep",
  "weight",
  "glucose",
  "water",
];
