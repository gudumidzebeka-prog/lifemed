"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";

interface AddMedicationModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddMedicationModal({ open, onClose }: AddMedicationModalProps) {
  const { t } = useTranslation();
  const { addMedication } = useHealthDataContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: new Date().toISOString().slice(0, 10),
    prescriber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: err } = await addMedication({
      name: form.name,
      dosage: form.dosage,
      frequency: form.frequency || t("modals.medFrequencyDefault"),
      startDate: form.startDate,
      prescriber: form.prescriber || undefined,
    });

    setLoading(false);
    if (err) {
      setError(err);
      return;
    }

    setForm({
      name: "",
      dosage: "",
      frequency: "",
      startDate: new Date().toISOString().slice(0, 10),
      prescriber: "",
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t("modals.medAddTitle")}>
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
        <Input
          label={t("modals.medStartDate")}
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          required
        />
        <Input
          label={t("modals.medPrescriber")}
          value={form.prescriber}
          onChange={(e) => setForm({ ...form, prescriber: e.target.value })}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? t("common.saving") : t("common.add")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
