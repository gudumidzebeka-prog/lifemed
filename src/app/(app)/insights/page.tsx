"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { calculateTodayScore, getRecentTrackerTrend } from "@/lib/health/today-score";
import { formatDate } from "@/lib/utils";

export default function InsightsPage() {
  const { t, locale } = useTranslation();
  const { profile, loading } = useHealthDataContext();

  const score = useMemo(() => calculateTodayScore(profile), [profile]);
  const weightTrend = useMemo(() => getRecentTrackerTrend("weight"), []);
  const sleepTrend = useMemo(() => getRecentTrackerTrend("sleep"), []);

  if (loading) {
    return <div className="py-20 text-center text-muted">{t("common.loading")}</div>;
  }

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
        {[
          { label: t("insights.breakdownTrackers"), value: score.trackers },
          { label: t("insights.breakdownChecklist"), value: score.checklist },
          { label: t("insights.breakdownProfile"), value: score.profile },
          { label: t("insights.breakdownMedications"), value: score.medications },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <p className="text-sm text-muted">{item.label}</p>
              <p className="mt-1 text-2xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("insights.progressGraphs")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <TrendBars
            title={t("trackers.types.weight")}
            entries={weightTrend}
            locale={locale}
            emptyLabel={t("insights.noTrendData")}
          />
          <TrendBars
            title={t("trackers.types.sleep")}
            entries={sleepTrend}
            locale={locale}
            emptyLabel={t("insights.noTrendData")}
          />
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

function TrendBars({
  title,
  entries,
  locale,
  emptyLabel,
}: {
  title: string;
  entries: { value: number; recordedAt: string }[];
  locale: "ka" | "ru" | "en";
  emptyLabel: string;
}) {
  const max = Math.max(...entries.map((entry) => entry.value), 1);

  if (entries.length === 0) {
    return (
      <div>
        <p className="mb-2 text-sm font-medium">{title}</p>
        <p className="text-sm text-muted">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm font-medium">{title}</p>
      <div className="flex items-end gap-2 h-28">
        {entries.map((entry) => (
          <div key={entry.recordedAt} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md bg-lifemed-400 dark:bg-lifemed-500"
              style={{ height: `${Math.max(12, (entry.value / max) * 100)}%` }}
            />
            <span className="text-[10px] text-muted">{formatDate(entry.recordedAt, locale, { day: "numeric", month: "short" })}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
