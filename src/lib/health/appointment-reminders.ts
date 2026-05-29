import type { Appointment } from "@/types/health";
import { loadPreferences } from "@/lib/settings-prefs";
import { canShowNotifications, showBrowserNotification } from "@/lib/health/browser-notifications";

const MS_24H = 24 * 60 * 60 * 1000;

function notificationKey(appointmentId: string, appointmentDate: string) {
  return `lifemed-apt-notified-${appointmentId}-${appointmentDate.slice(0, 16)}`;
}

function wasNotified(appointmentId: string, appointmentDate: string) {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(notificationKey(appointmentId, appointmentDate)) === "1";
}

function markNotified(appointmentId: string, appointmentDate: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(notificationKey(appointmentId, appointmentDate), "1");
}

export function checkAppointmentReminders(
  appointments: Appointment[],
  notify: (appointment: Appointment) => void
) {
  if (typeof window === "undefined") return;
  if (!loadPreferences().appointmentReminders) return;
  if (!canShowNotifications()) return;

  const now = Date.now();

  for (const appointment of appointments) {
    const apptTime = new Date(appointment.date).getTime();
    if (Number.isNaN(apptTime) || apptTime <= now) continue;

    const remindAt = apptTime - MS_24H;
    if (now < remindAt) continue;
    if (wasNotified(appointment.id, appointment.date)) continue;

    notify(appointment);
    markNotified(appointment.id, appointment.date);
  }
}

export async function showAppointmentReminderNotification(
  appointment: Appointment,
  title: string,
  body: string
) {
  await showBrowserNotification(
    title,
    body,
    `lifemed-apt-${appointment.id}`,
    "/appointments"
  );
}
