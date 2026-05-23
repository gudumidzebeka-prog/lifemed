"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { useTimelineTypeLabel } from "@/lib/i18n/hooks";
import { TIMELINE_EVENT_TYPES } from "@/lib/constants";
import type { TimelineEvent, TimelineEventType } from "@/types/health";

interface EditTimelineEventModalProps {
  open: boolean;
  onClose: () => void;
  event: TimelineEvent | null;
}

export function EditTimelineEventModal({ open, onClose, event }: EditTimelineEventModalProps) {
  const { t } = useTranslation();
  const getTimelineTypeLabel = useTimelineTypeLabel();
  const { editTimelineEvent } = useHealthDataContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "doctor_visit" as TimelineEventType,
    title: "",
    description: "",
    date: "",
    provider: "",
  });

  useEffect(() => {
    if (event) {
      setForm({
        type: event.type,
        title: event.title,
        description: event.description ?? "",
        date: event.date.slice(0, 10),
        provider: event.provider ?? "",
      });
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setLoading(true);
    setError(null);

    const { error: err } = await editTimelineEvent(event.id, {
      type: form.type,
      title: form.title,
      description: form.description || undefined,
      date: form.date,
      provider: form.provider || undefined,
    });

    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t("modals.timelineEditTitle")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-rose-600">{error}</p>}

        <Select
          label={t("modals.timelineType")}
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as TimelineEventType })}
          options={TIMELINE_EVENT_TYPES.map((type) => ({
            value: type,
            label: getTimelineTypeLabel(type),
          }))}
        />

        <Input
          label={t("modals.timelineTitle")}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <Input
          label={t("modals.timelineDate")}
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />

        <Input
          label={t("modals.timelineProvider")}
          value={form.provider}
          onChange={(e) => setForm({ ...form, provider: e.target.value })}
        />

        <Textarea
          label={t("modals.timelineDescription")}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}