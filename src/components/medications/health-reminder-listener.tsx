"use client";

import { useEffect } from "react";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import {
  checkMedicationReminders,
  showMedicationReminderNotification,
} from "@/lib/health/medication-reminders";
import {
  checkAppointmentReminders,
  showAppointmentReminderNotification,
} from "@/lib/health/appointment-reminders";
import {
  ensureNotificationPermission,
  registerReminderServiceWorker,
} from "@/lib/health/browser-notifications";
import { loadPreferences } from "@/lib/settings-prefs";
import { formatDate } from "@/lib/utils";
import { isoToTimeValue } from "@/lib/dates";

const TICK_MS = 15_000;

export function HealthReminderListener() {
  const { t, locale } = useTranslation();
  const { profile, appointments, loading } = useHealthDataContext();

  useEffect(() => {
    void registerReminderServiceWorker();
  }, []);

  useEffect(() => {
    if (loading) return;

    const prefs = loadPreferences();
    if (!prefs.medicationReminders && !prefs.appointmentReminders) return;

    void ensureNotificationPermission();
  }, [loading]);

  useEffect(() => {
    if (loading) return;

    const tick = () => {
      checkMedicationReminders(profile.currentMedications, (medication, time) => {
        void showMedicationReminderNotification(
          medication,
          time,
          t("notifications.medicationTitle"),
          t("notifications.medicationBody", {
            name: medication.name,
            dosage: medication.dosage,
            time,
          })
        );
      });

      checkAppointmentReminders(appointments, (appointment) => {
        const when = `${formatDate(appointment.date, locale, {
          day: "numeric",
          month: "short",
        })} ${isoToTimeValue(appointment.date)}`;

        void showAppointmentReminderNotification(
          appointment,
          t("notifications.appointmentTitle"),
          t("notifications.appointmentBody", {
            title: appointment.title,
            provider: appointment.provider,
            when,
          })
        );
      });
    };

    tick();

    const interval = window.setInterval(tick, TICK_MS);
    const onFocus = () => tick();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [loading, profile.currentMedications, appointments, t, locale]);

  return null;
}
