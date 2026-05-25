"use client";

import { useEffect } from "react";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import {
  checkMedicationReminders,
  showMedicationReminderNotification,
} from "@/lib/health/medication-reminders";

export function MedicationReminderListener() {
  const { t } = useTranslation();
  const { profile, loading } = useHealthDataContext();

  useEffect(() => {
    if (loading) return;

    const tick = () => {
      checkMedicationReminders(profile.currentMedications, (medication, time) => {
        showMedicationReminderNotification(
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
    };

    tick();
    const interval = window.setInterval(tick, 30_000);
    return () => window.clearInterval(interval);
  }, [loading, profile.currentMedications, t]);

  return null;
}
