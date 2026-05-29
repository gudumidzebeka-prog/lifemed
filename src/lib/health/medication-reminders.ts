import type { Medication } from "@/types/health";
import { loadPreferences } from "@/lib/settings-prefs";
import { canShowNotifications, showBrowserNotification } from "@/lib/health/browser-notifications";

export function normalizeReminderTime(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function sanitizeReminderTimes(times: string[]): string[] {
  const unique = new Set<string>();
  for (const time of times) {
    const normalized = normalizeReminderTime(time);
    if (normalized) unique.add(normalized);
  }
  return Array.from(unique).sort();
}

export function formatReminderTimes(times: string[] | undefined, emptyLabel: string) {
  const sanitized = sanitizeReminderTimes(times ?? []);
  return sanitized.length > 0 ? sanitized.join(", ") : emptyLabel;
}

function notificationKey(medicationId: string, time: string, dateKey: string) {
  return `lifemed-notified-${dateKey}-${medicationId}-${time.replace(":", "")}`;
}

function wasNotifiedToday(medicationId: string, time: string, dateKey: string) {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(notificationKey(medicationId, time, dateKey)) === "1";
}

function markNotifiedToday(medicationId: string, time: string, dateKey: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(notificationKey(medicationId, time, dateKey), "1");
}

function currentLocalTimeKey(now = new Date()) {
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function localDateKey(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function checkMedicationReminders(
  medications: Medication[],
  notify: (medication: Medication, time: string) => void
) {
  if (typeof window === "undefined") return;
  if (!loadPreferences().medicationReminders) return;
  if (!canShowNotifications()) return;

  const now = new Date();
  const currentTime = currentLocalTimeKey(now);
  const dateKey = localDateKey(now);

  for (const medication of medications) {
    const times = sanitizeReminderTimes(medication.reminderTimes ?? []);
    for (const time of times) {
      if (time !== currentTime) continue;
      if (wasNotifiedToday(medication.id, time, dateKey)) continue;
      notify(medication, time);
      markNotifiedToday(medication.id, time, dateKey);
    }
  }
}

export async function showMedicationReminderNotification(
  medication: Medication,
  time: string,
  title: string,
  body: string
) {
  await showBrowserNotification(
    title,
    body,
    `lifemed-med-${medication.id}-${time}`,
    "/dashboard"
  );
}
