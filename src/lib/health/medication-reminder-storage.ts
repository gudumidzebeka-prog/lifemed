const STORAGE_KEY = "lifemed-medication-reminder-times";

export function loadMedicationReminderTimes(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveMedicationReminderTimes(map: Record<string, string[]>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function setMedicationReminderTimes(medicationId: string, times: string[]) {
  const map = loadMedicationReminderTimes();
  if (times.length === 0) {
    delete map[medicationId];
  } else {
    map[medicationId] = times;
  }
  saveMedicationReminderTimes(map);
}

export function mergeMedicationReminderTimes<T extends { id: string; reminderTimes?: string[] }>(
  medications: T[]
): T[] {
  const stored = loadMedicationReminderTimes();
  return medications.map((med) => ({
    ...med,
    reminderTimes: med.reminderTimes?.length ? med.reminderTimes : stored[med.id] ?? [],
  }));
}
