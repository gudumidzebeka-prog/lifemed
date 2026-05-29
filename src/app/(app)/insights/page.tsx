"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import {
  calculateTodayScore,
  getRecentTrackerTrend,
  SCORE_MAX,
} from "@/lib/health/today-score";
import { loadTrackerEntries, type TrackerEntry, type TrackerType } from "@/lib/health/trackers";
import { TrackerLineChart } from "@/components/health/tracker-line-chart";

const CHART_TYPES: TrackerType[] = ["weight", "sleep", "glucose", "blood-pressure"];

export default function InsightsPage() {
  const { t, locale } = useTranslation();
  const { profile, loading } = useHealthDataContext();
  const [trackerEntries, setTrackerEntries] = useState<ReturnType<typeof loadTrackerEntries>>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setTrackerEntries(loadTrackerEntries());
      setReady(true);
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const score = useMemo(
    () => calculateTodayScore(profile, 4, trackerEntries),
    [profile, trackerEntries]
  );

  const trends = useMemo(
    () =>
      Object.fromEntries(
        CHART_TYPES.map((type) => [type, getRecentTrackerTrend(type, 7, trackerEntries)])
      ) as Record<TrackerType, TrackerEntry[]>,
    [trackerEntries]
  );

  if (loading || !ready) {
    return <div className="py-20 text-center text-muted">{t("common.loading")}</div>;
  }

  const breakdown = [
    { label: t("insights.breakdownTrackers"), value: score.trackers, max: SCORE_MAX.trackers },
    { label: t("insights.breakdownChecklist"), value: score.checklist, max: SCORE_MAX.checklist },
    { label: t("insights.breakdownProfile"), value: score.profile, max: SCORE_MAX.profile },
    { label: t("insights.breakdownMedications"), value: score.medications, max: SCORE_MAX.medications },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("insights.title")}</h1>
        <p className="mt-1 text-muted">{t("insights.subtitle")}</p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-4 p-8 sm:flex-row sm:justify-between">
          <div>
            <p className="text-sm text-muted">{t("insights.todayScore")}</p>
            <p className="text-4xl font-bold text-foreground">{score.total}</p>
            <p className="mt-1 text-sm text-muted">{t("insights.todayScoreHint")}</p>
          </div>
          <div
            className="relative flex h-32 w-32 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(rgb(20 184 166) ${score.total * 3.6}deg, rgb(226 232 240) 0)`,
            }}
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface text-xl font-bold">
              {score.total}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {breakdown.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <p className="text-sm text-muted">{item.label}</p>
              <p className="mt-1 text-2xl font-bold">
                {item.value}
                <span className="text-base font-normal text-muted"> / {item.max}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("insights.progressGraphs")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-10">
          {CHART_TYPES.map((type) => {
            const entries = trends[type];
            const isBloodPressure = type === "blood-pressure";

            return (
              <div key={type} className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  {t(`trackers.types.${type}` as "trackers.types.weight")}
                </p>
                <TrackerLineChart
                  entries={entries}
                  locale={locale}
                  emptyLabel={t("insights.noTrendData")}
                  unit={t(`trackers.unit.${type}` as "trackers.unit.pulse")}
                  primaryLabel={isBloodPressure ? t("trackers.systolic") : undefined}
                  showSecondaryLine={isBloodPressure}
                  secondaryLabel={isBloodPressure ? t("trackers.diastolic") : undefined}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button href="/trackers">{t("insights.openTrackers")}</Button>
        <Button variant="secondary" href="/health-report">
          {t("insights.exportReport")}
        </Button>
      </div>
    </div>
  );
}
