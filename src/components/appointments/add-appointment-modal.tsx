"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";

interface AddAppointmentModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddAppointmentModal({ open, onClose }: AddAppointmentModalProps) {
  const { t } = useTranslation();
  const { addAppointment } = useHealthDataContext();
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !provider.trim() || !date) return;

    setLoading(true);
    setError(null);

    const { error: err } = await addAppointment({
      title: title.trim(),
      provider: provider.trim(),
      date: new Date(date).toISOString(),
      location: location.trim() || undefined,
    });

    setLoading(false);
    if (err) {
      setError(err);
      return;
    }

    setTitle("");
    setProvider("");
    setDate("");
    setLocation("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t("modals.aptAddTitle")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <Input label={t("modals.aptTitle")} value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input
          label={t("modals.aptProvider")}
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          required
        />
        <Input
          label={t("modals.aptDatetime")}
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <Input label={t("modals.aptLocation")} value={location} onChange={(e) => setLocation(e.target.value)} />
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