"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInput, type DateInputHandle } from "@/components/ui/date-input";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { combineIsoDateAndTime, isoToLocalDateOnly, isoToTimeValue } from "@/lib/dates";
import type { Appointment } from "@/types/health";

interface AddAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
}

export function AddAppointmentModal({ open, onClose, appointment }: AddAppointmentModalProps) {
  const { t } = useTranslation();
  const { addAppointment, editAppointment } = useHealthDataContext();
  const dateInputRef = useRef<DateInputHandle>(null);
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("");
  const [dateIso, setDateIso] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(appointment);

  useEffect(() => {
    if (!open) return;
    if (appointment) {
      setTitle(appointment.title);
      setProvider(appointment.provider);
      setDateIso(isoToLocalDateOnly(appointment.date));
      setTime(isoToTimeValue(appointment.date));
      setLocation(appointment.location ?? "");
      setError(null);
      return;
    }
    setTitle("");
    setProvider("");
    setDateIso("");
    setTime("");
    setLocation("");
    setError(null);
  }, [appointment, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const committedDateIso = dateInputRef.current?.commit() || dateIso;

    if (!title.trim() || !provider.trim()) {
      setError(t("common.errorGeneric"));
      return;
    }

    if (!committedDateIso) {
      setError(t("modals.timelineDate"));
      return;
    }

    if (!time.trim()) {
      setError(t("modals.aptTime"));
      return;
    }

    const isoDate = combineIsoDateAndTime(committedDateIso, time);
    if (!isoDate) {
      setError(t("common.errorGeneric"));
      return;
    }

    setLoading(true);

    const payload = {
      title: title.trim(),
      provider: provider.trim(),
      date: isoDate,
      location: location.trim() || undefined,
    };

    const { error: err } = isEditing && appointment
      ? await editAppointment(appointment.id, payload)
      : await addAppointment(payload);

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
      title={isEditing ? t("modals.aptEditTitle") : t("modals.aptAddTitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <Input label={t("modals.aptTitle")} value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input
          label={t("modals.aptProvider")}
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <DateInput
            ref={dateInputRef}
            label={t("modals.timelineDate")}
            value={dateIso}
            onChange={setDateIso}
            required
          />
          <Input
            label={t("modals.aptTime")}
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        <Input label={t("modals.aptLocation")} value={location} onChange={(e) => setLocation(e.target.value)} />
        <div className="flex gap-3 pt-2">
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
