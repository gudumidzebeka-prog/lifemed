"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/components/providers/locale-provider";
import { getCategoryPageHref } from "@/lib/health/categories";
import {
  addTrackerEntry,
  getTrackerEntriesByType,
  loadTrackerEntries,
  TRACKER_TYPES,
  type TrackerType,
} from "@/lib/health/trackers";
import { recordWellnessActivity } from "@/lib/health/wellness";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Activity, Droplets, Heart, Moon, Pill, Scale, Wind } from "lucide-react";

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
  const [entries, setEntries] = useState(loadTrackerEntries());
  const [activeType, setActiveType] = useState<TrackerType>("blood-pressure");
  const [value, setValue] = useState("");
  const [valueSecondary, setValueSecondary] = useState("");
  const [note, setNote] = useState("");

  const recent = useMemo(() => getTrackerEntriesByType(activeType, 7), [activeType, entries]);

  const trackerLabel = (type: TrackerType) => t(`trackers.types.${type}` as "trackers.types.blood-pressure");

  const handleSave = () => {
    const primary = Number(value);
    if (!Number.isFinite(primary) || primary <= 0) return;

    const payload =
      activeType === "blood-pressure"
        ? {
            type: activeType,
            value: primary,
            valueSecondary: Number(valueSecondary) || undefined,
            note: note.trim() || undefined,
          }
        : {
            type: activeType,
            value: primary,
            note: note.trim() || undefined,
          };

    addTrackerEntry(payload);
    recordWellnessActivity();
    setEntries(loadTrackerEntries());
    setValue("");
    setValueSecondary("");
    setNote("");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("trackers.title")}</h1>
        <p className="mt-1 text-muted">{t("trackers.subtitle")}</p>
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
              onClick={() => setActiveType(type)}
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{trackerLabel(activeType)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={
                activeType === "blood-pressure"
                  ? t("trackers.systolic")
                  : t("trackers.value")
              }
              type="number"
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
          <Button type="button" onClick={handleSave}>
            {t("trackers.saveEntry")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("trackers.recent")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recent.length === 0 ? (
            <p className="text-sm text-muted">{t("trackers.noEntries")}</p>
          ) : (
            recent.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {entry.type === "blood-pressure" && entry.valueSecondary
                      ? `${entry.value}/${entry.valueSecondary} ${t("trackers.unit.blood-pressure")}`
                      : `${entry.value} ${t(`trackers.unit.${entry.type}` as "trackers.unit.pulse")}`}
                  </p>
                  {entry.note ? <p className="text-xs text-muted">{entry.note}</p> : null}
                </div>
                <time className="text-xs text-muted">{formatDate(entry.recordedAt, locale)}</time>
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
