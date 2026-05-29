"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import { MedicationReminderFields } from "@/components/medications/medication-reminder-fields";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { sanitizeReminderTimes } from "@/lib/health/medication-reminders";
import { ensureNotificationPermission } from "@/lib/health/browser-notifications";
import type { Medication } from "@/types/health";

interface AddMedicationModalProps {
  open: boolean;
  onClose: () => void;
  medication?: Medication | null;
}

export function AddMedicationModal({ open, onClose, medication }: AddMedicationModalProps) {
  const { t } = useTranslation();
  const { addMedication, editMedication, removeMedication } = useHealthDataContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: new Date().toISOString().slice(0, 10),
    prescriber: "",
  });
  const [reminderTimes, setReminderTimes] = useState<string[]>([""]);

  const isEditing = Boolean(medication);

  useEffect(() => {
    if (!open) return;
    if (medication) {
      setForm({
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        startDate: medication.startDate.slice(0, 10),
        prescriber: medication.prescriber ?? "",
      });
      setReminderTimes(
        medication.reminderTimes?.length ? medication.reminderTimes : [""]
      );
      return;
    }
    setForm({
      name: "",
      dosage: "",
      frequency: "",
      startDate: new Date().toISOString().slice(0, 10),
      prescriber: "",
    });
    setReminderTimes([""]);
  }, [medication, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const times = sanitizeReminderTimes(reminderTimes);
    if (times.length > 0) {
      await ensureNotificationPermission();
    }

    const payload = {
      name: form.name,
      dosage: form.dosage,
      frequency: form.frequency || t("modals.medFrequencyDefault"),
      startDate: form.startDate,
      prescriber: form.prescriber || undefined,
      reminderTimes: times,
    };

    const { error: err } = isEditing && medication
      ? await editMedication(medication.id, payload)
      : await addMedication(payload);

    setLoading(false);
    if (err) {
      setError(err);
      return;
    }

    onClose();
  };

  const handleRemove = async () => {
    if (!medication) return;

    setLoading(true);
    setError(null);
    const { error: err } = await removeMedication(medication.id);
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? t("modals.medEditTitle") : t("modals.medAddTitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-rose-600">{error}</p>}

        <Input
          label={t("modals.medName")}
          placeholder={t("modals.medNamePlaceholder")}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label={t("modals.medDosage")}
          placeholder={t("modals.medDosagePlaceholder")}
          value={form.dosage}
          onChange={(e) => setForm({ ...form, dosage: e.target.value })}
          required
        />
        <Input
          label={t("modals.medFrequency")}
          placeholder={t("modals.medFrequencyDefault")}
          value={form.frequency}
          onChange={(e) => setForm({ ...form, frequency: e.target.value })}
          required
        />
        <DateInput
          label={t("modals.medStartDate")}
          value={form.startDate}
          onChange={(startDate) => setForm({ ...form, startDate })}
          required
        />
        <Input
          label={t("modals.medPrescriber")}
          value={form.prescriber}
          onChange={(e) => setForm({ ...form, prescriber: e.target.value })}
        />

        <MedicationReminderFields times={reminderTimes} onChange={setReminderTimes} />

        <div className="flex gap-3 pt-2">
          {isEditing ? (
            <Button
              type="button"
              variant="secondary"
              className="text-rose-600"
              onClick={handleRemove}
              disabled={loading}
            >
              {t("common.remove")}
            </Button>
          ) : null}
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? t("common.saving") : isEditing ? t("common.save") : t("common.add")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
