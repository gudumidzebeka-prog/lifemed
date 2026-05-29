"use client";

import { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/components/providers/locale-provider";
import { getCategoryPageHref } from "@/lib/health/categories";
import {
  addTrackerEntry,
  deleteTrackerEntry,
  formatTrackerValue,
  getTrackerEntriesByType,
  loadTrackerEntries,
  TRACKER_TYPES,
  updateTrackerEntry,
  type TrackerEntry,
  type TrackerType,
} from "@/lib/health/trackers";
import { recordWellnessActivity } from "@/lib/health/wellness";
import { formatDate } from "@/lib/utils";
import {
  Activity,
  Droplets,
  Heart,
  Moon,
  Pill,
  Plus,
  Pencil,
  Scale,
  Trash2,
  Wind,
} from "lucide-react";

const trackerIcons: Record<TrackerType, typeof Activity> = {
  "blood-pressure": Heart,
  pulse: Activity,
  sleep: Moon,
  weight: Scale,
  glucose: Droplets,
  water: Wind,
};

export default function TrackersPage() {
  const { t, locale } = useTranslation();
  const formRef = useRef<HTMLDivElement>(null);
  const [entries, setEntries] = useState(loadTrackerEntries());
  const [activeType, setActiveType] = useState<TrackerType>("blood-pressure");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [valueSecondary, setValueSecondary] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const recent = useMemo(() => getTrackerEntriesByType(activeType, 14), [activeType, entries]);
  const latestEntry = recent[0] ?? null;

  const trackerLabel = (type: TrackerType) => t(`trackers.types.${type}` as "trackers.types.blood-pressure");
  const unitLabel = (type: TrackerType) => t(`trackers.unit.${type}` as "trackers.unit.pulse");
  const valueHint = (type: TrackerType) => t(`trackers.valueHints.${type}` as "trackers.valueHints.pulse");

  const resetForm = () => {
    setEditingId(null);
    setValue("");
    setValueSecondary("");
    setNote("");
    setFormError(null);
  };

  const refreshEntries = () => setEntries(loadTrackerEntries());

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const startAdd = () => {
    resetForm();
    scrollToForm();
  };

  const startEdit = (entry: TrackerEntry) => {
    setActiveType(entry.type);
    setEditingId(entry.id);
    setValue(String(entry.value));
    setValueSecondary(entry.valueSecondary != null ? String(entry.valueSecondary) : "");
    setNote(entry.note ?? "");
    setFormError(null);
    scrollToForm();
  };

  const handleSave = () => {
    const primary = Number(value);
    const secondary = Number(valueSecondary);

    if (!Number.isFinite(primary) || primary <= 0) {
      setFormError(t("trackers.invalidValue"));
      return;
    }

    if (activeType === "blood-pressure" && (!Number.isFinite(secondary) || secondary <= 0)) {
      setFormError(t("trackers.invalidBloodPressure"));
      return;
    }

    const payload = {
      type: activeType,
      value: primary,
      valueSecondary: activeType === "blood-pressure" ? secondary : undefined,
      note: note.trim() || undefined,
    };

    if (editingId) {
      updateTrackerEntry(editingId, payload);
    } else {
      addTrackerEntry(payload);
      recordWellnessActivity();
    }

    refreshEntries();
    resetForm();
  };

  const handleDelete = (entry: TrackerEntry) => {
    if (!confirm(t("trackers.deleteConfirm"))) return;
    deleteTrackerEntry(entry.id);
    if (editingId === entry.id) resetForm();
    refreshEntries();
  };

  const handleTypeChange = (type: TrackerType) => {
    setActiveType(type);
    if (editingId) resetForm();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("trackers.title")}</h1>
          <p className="mt-1 text-muted">{t("trackers.subtitle")}</p>
        </div>
        <Button type="button" size="sm" onClick={startAdd}>
          <Plus className="h-4 w-4" />
          {t("trackers.addEntry")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("trackers.medicationNote")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">{t("trackers.medicationNoteDesc")}</p>
          <Button variant="secondary" size="sm" className="mt-3" href={getCategoryPageHref("medications")}>
            <Pill className="h-4 w-4" />
            {t("trackers.openMedications")}
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TRACKER_TYPES.map((type) => {
          const Icon = trackerIcons[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                activeType === type
                  ? "border-lifemed-400 bg-lifemed-50 text-lifemed-700 dark:bg-lifemed-950/40"
                  : "border-border bg-surface text-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
              {trackerLabel(type)}
            </button>
          );
        })}
      </div>

      <Card ref={formRef}>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-base">
            {editingId ? t("trackers.editEntry") : trackerLabel(activeType)}
          </CardTitle>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={t("trackers.addEntry")}
              onClick={startAdd}
            >
              <Plus className="h-4 w-4" />
            </Button>
            {latestEntry ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={t("common.edit")}
                onClick={() => startEdit(latestEntry)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted">{valueHint(activeType)}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={activeType === "blood-pressure" ? t("trackers.systolic") : t("trackers.value")}
              type="number"
              step={activeType === "sleep" ? "0.5" : "1"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            {activeType === "blood-pressure" && (
              <Input
                label={t("trackers.diastolic")}
                type="number"
                value={valueSecondary}
                onChange={(e) => setValueSecondary(e.target.value)}
              />
            )}
          </div>
          <Input label={t("trackers.noteOptional")} value={note} onChange={(e) => setNote(e.target.value)} />
          {formError ? <p className="text-sm text-rose-600 dark:text-rose-400">{formError}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleSave}>
              {editingId ? t("trackers.updateEntry") : t("trackers.addEntry")}
            </Button>
            {editingId ? (
              <Button type="button" variant="secondary" onClick={resetForm}>
                {t("trackers.cancelEdit")}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-base">{t("trackers.recent")}</CardTitle>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={t("trackers.addEntry")}
              onClick={startAdd}
            >
              <Plus className="h-4 w-4" />
            </Button>
            {latestEntry ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={t("common.edit")}
                onClick={() => startEdit(latestEntry)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recent.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted">{t("trackers.noEntries")}</p>
              <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={startAdd}>
                <Plus className="h-4 w-4" />
                {t("trackers.addEntry")}
              </Button>
            </div>
          ) : (
            recent.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-xl border border-border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {formatTrackerValue(entry, unitLabel("blood-pressure"), unitLabel)}
                  </p>
                  {entry.note ? <p className="text-xs text-muted">{entry.note}</p> : null}
                  <time className="mt-1 block text-xs text-muted">
                    {formatDate(entry.recordedAt, locale, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={t("common.edit")}
                    onClick={() => startEdit(entry)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-rose-600 hover:text-rose-700 dark:text-rose-400"
                    aria-label={t("trackers.deleteEntry")}
                    onClick={() => handleDelete(entry)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" size="sm" href="/insights">
          {t("trackers.viewInsights")}
        </Button>
        <Button variant="ghost" size="sm" href="/wellness">
          {t("trackers.viewWellness")}
        </Button>
      </div>
    </div>
  );
}
