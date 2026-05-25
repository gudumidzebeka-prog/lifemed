"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, Disclaimer } from "@/components/ui/badge";
import { DataModeBanner } from "@/components/layout/data-mode-banner";
import { ClearDemoDataBanner } from "@/components/onboarding/clear-demo-data-banner";
import { SeedSampleDataButton } from "@/components/onboarding/seed-sample-data-button";
import { SetupBanner } from "@/components/onboarding/setup-banner";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { displayFirstName } from "@/lib/health/empty-profile";
import { useTimelineTypeLabel, useDocumentCategoryLabel, useMedicationFrequencyLabel } from "@/lib/i18n/hooks";
import { buildHealthSummary } from "@/lib/health/categories";
import { getTimelineTypeColor } from "@/data/demo-data";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import {
  Upload,
  Sparkles,
  Calendar,
  Pill,
  ArrowRight,
  TrendingUp,
  FileText,
  Clock,
  Plus,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { t, locale } = useTranslation();
  const getTimelineTypeLabel = useTimelineTypeLabel();
  const getDocumentCategoryLabel = useDocumentCategoryLabel();
  const getMedicationFrequencyLabel = useMedicationFrequencyLabel();
  const { mode, loading, profile, timeline, documents, appointments } = useHealthDataContext();

  const recentTimeline = [...timeline].slice(-4).reverse();
  const recentDocs = documents.slice(0, 3);
  const aiSummary = buildHealthSummary(profile, timeline, documents, locale);
  const nextAppointment = appointments.find((a) => new Date(a.date) >= new Date()) ?? appointments[0];

  const healthStats = [
    {
      label: t("dashboard.statTimeline"),
      value: timeline.length,
      trend: "stable" as const,
      href: "/timeline",
    },
    {
      label: t("dashboard.statDocuments"),
      value: documents.length,
      trend: "up" as const,
      href: "/documents?upload=true",
    },
    {
      label: t("dashboard.statMedications"),
      value: profile.currentMedications.length,
      trend: "stable" as const,
      href: "/profile",
    },
    {
      label: t("dashboard.statYears"),
      value: timeline.length
        ? new Date().getFullYear() - new Date(timeline[0].date).getFullYear()
        : 0,
      trend: "up" as const,
      href: "/timeline",
    },
  ];

  const isEmptySummary = timeline.length === 0 && documents.length === 0;

  if (loading) {
    return <div className="py-20 text-center text-muted">{t("common.loading")}</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <DataModeBanner mode={mode} />
      <ClearDemoDataBanner />
      <SetupBanner />
      <SeedSampleDataButton />
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t("dashboard.greeting", { name: displayFirstName(profile.fullName, t("ai.you")) })}
          </h1>
          <p className="mt-1 text-muted">{t("dashboard.subtitle")}</p>
        </div>
        <Button href="/documents?upload=true">
          <Upload className="h-4 w-4" />
          {t("dashboard.quickUpload")}
        </Button>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {healthStats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group block rounded-2xl no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lifemed-400 focus-visible:ring-offset-2"
          >
            <Card className="card-hover h-full cursor-pointer transition-transform group-hover:scale-[1.01]">
              <CardContent className="p-5">
                <p className="text-sm text-muted">{stat.label}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                  {stat.trend === "up" && <TrendingUp className="h-4 w-4 text-emerald-500" />}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="gradient-soft border-lifemed-200 dark:border-lifemed-800 overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lifemed-500 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>{t("dashboard.aiTitle")}</CardTitle>
                  <p className="text-sm text-muted mt-0.5">{t("dashboard.aiSubtitle")}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" href="/ai-assistant">
                {t("dashboard.askAi")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{aiSummary}</p>
              {isEmptySummary && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" href="/documents?upload=true">
                    <Upload className="h-4 w-4" />
                    {t("dashboard.addDocument")}
                  </Button>
                  <Button variant="secondary" size="sm" href="/timeline?add=true">
                    <Clock className="h-4 w-4" />
                    {t("dashboard.addTimelineEvent")}
                  </Button>
                </div>
              )}
              <Disclaimer variant="info" className="mt-4" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-lifemed-500" />
                {t("dashboard.nextAppointment")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextAppointment ? (
                <>
                  <p className="font-medium text-foreground">{nextAppointment.title}</p>
                  <p className="text-sm text-muted mt-1">{nextAppointment.provider}</p>
                  <p className="text-sm text-lifemed-600 dark:text-lifemed-400 mt-2">
                    {formatDate(nextAppointment.date, locale, {
                      weekday: "long",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  {nextAppointment.location && (
                    <p className="text-xs text-muted mt-1">{nextAppointment.location}</p>
                  )}
                  <Link
                    href="/appointments"
                    className="inline-block mt-3 text-xs text-lifemed-600 dark:text-lifemed-400 hover:underline"
                  >
                    {t("dashboard.viewAppointments")}
                  </Link>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted">{t("dashboard.noAppointments")}</p>
                  <Button variant="secondary" size="sm" href="/appointments?add=true">
                    <Plus className="h-4 w-4" />
                    {t("appointments.add")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Pill className="h-4 w-4 text-lifemed-500" />
                {t("dashboard.todayMedications")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.currentMedications.length > 0 ? (
                profile.currentMedications.map((med) => (
                  <div key={med.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{med.name}</p>
                      <p className="text-xs text-muted">
                        {med.dosage} · {getMedicationFrequencyLabel(med.frequency)}
                      </p>
                    </div>
                    <Badge variant="success">{t("common.active")}</Badge>
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted">{t("dashboard.noMedications")}</p>
                  <Button variant="secondary" size="sm" href="/profile?med=true">
                    <Plus className="h-4 w-4" />
                    {t("profile.addMedication")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-lifemed-500" />
                {t("dashboard.recentTimeline")}
              </CardTitle>
              <Button variant="ghost" size="sm" href="/timeline">
                {t("common.viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTimeline.length > 0 ? (
                recentTimeline.map((event, i) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-lifemed-400 ring-4 ring-lifemed-100 dark:ring-lifemed-900/40" />
                      {i < recentTimeline.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{event.title}</span>
                        <span className={cnBadge(getTimelineTypeColor(event.type))}>
                          {getTimelineTypeLabel(event.type)}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">{formatDate(event.date, locale)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border p-6 text-center">
                  <Clock className="mx-auto h-8 w-8 text-muted/50" />
                  <p className="mt-2 text-sm text-muted">{t("dashboard.noTimeline")}</p>
                  <Button className="mt-4" size="sm" href="/timeline?add=true">
                    <Plus className="h-4 w-4" />
                    {t("dashboard.addTimelineEvent")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-lifemed-500" />
                {t("dashboard.recentUploads")}
              </CardTitle>
              <Button variant="ghost" size="sm" href="/documents?upload=true">
                {t("common.viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentDocs.length > 0 ? (
                recentDocs.map((doc) => (
                  <Link
                    key={doc.id}
                    href="/documents"
                    className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-surface-elevated no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lifemed-400"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lifemed-50 text-lifemed-600 dark:bg-lifemed-950/50">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                      <p className="text-xs text-muted">
                        {getDocumentCategoryLabel(doc.category)} ·{" "}
                        {formatRelativeTime(doc.uploadedAt, locale)}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border p-6 text-center">
                  <FileText className="mx-auto h-8 w-8 text-muted/50" />
                  <p className="mt-2 text-sm text-muted">{t("documents.empty")}</p>
                  <Button className="mt-4" size="sm" href="/documents?upload=true">
                    <Upload className="h-4 w-4" />
                    {t("dashboard.addDocument")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function cnBadge(className: string) {
  return `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`;
}
