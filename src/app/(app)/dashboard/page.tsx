"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClearDemoDataBanner } from "@/components/onboarding/clear-demo-data-banner";
import { SetupBanner } from "@/components/onboarding/setup-banner";
import { AddAppointmentModal } from "@/components/appointments/add-appointment-modal";
import { AddMedicationModal } from "@/components/profile/add-medication-modal";
import { AddTimelineEventModal } from "@/components/timeline/add-event-modal";
import { EditTimelineEventModal } from "@/components/timeline/edit-event-modal";
import { DocumentViewerModal } from "@/components/documents/document-viewer-modal";
import { DashboardAiPanel } from "@/components/dashboard/dashboard-ai-panel";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { displayFirstName } from "@/lib/health/empty-profile";
import { useTimelineTypeLabel, useDocumentCategoryLabel, useMedicationFrequencyLabel } from "@/lib/i18n/hooks";
import { getTimelineTypeColor } from "@/data/demo-data";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { formatReminderTimes, sanitizeReminderTimes } from "@/lib/health/medication-reminders";
import type { Appointment, HealthDocument, Medication, TimelineEvent } from "@/types/health";
import {
  Upload,
  Calendar,
  Pill,
  ArrowRight,
  TrendingUp,
  FileText,
  Clock,
  Plus,
  Pencil,
  Eye,
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
  const { loading, profile, timeline, documents, appointments, resolveDocumentUrl, downloadDocument } =
    useHealthDataContext();

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editAppointment, setEditAppointment] = useState<Appointment | null>(null);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [editMedication, setEditMedication] = useState<Medication | null>(null);
  const [showTimelineAddModal, setShowTimelineAddModal] = useState(false);
  const [editTimelineEvent, setEditTimelineEvent] = useState<TimelineEvent | null>(null);
  const [viewerDoc, setViewerDoc] = useState<HealthDocument | null>(null);

  const openAppointmentModal = (appointment: Appointment | null = null) => {
    setEditAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const openMedicationModal = (medication: Medication | null = null) => {
    setEditMedication(medication);
    setShowMedicationModal(true);
  };

  const upcomingAppointments = appointments
    .filter((a) => new Date(a.date) >= new Date())
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextAppointment = upcomingAppointments[0] ?? null;

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

  if (loading) {
    return <div className="py-20 text-center text-muted">{t("common.loading")}</div>;
  }

  const recentTimeline = [...timeline].slice(-4).reverse();
  const recentDocs = documents.slice(0, 3);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <ClearDemoDataBanner />
      <SetupBanner />
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

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item}>
          <Card className="card-hover h-full overflow-hidden">
            <DashboardCardHeader
              href="/appointments"
              icon={<Calendar className="h-4 w-4 text-lifemed-500" />}
              title={t("dashboard.nextAppointment")}
              editLabel={t("common.edit")}
              onEdit={() => openAppointmentModal(nextAppointment)}
            />
            <Link href="/appointments" className="block no-underline text-inherit">
              <CardContent>
                {nextAppointment ? (
                  <>
                    <p className="font-medium text-foreground">{nextAppointment.title}</p>
                    <p className="mt-1 text-sm text-muted">{nextAppointment.provider}</p>
                    <p className="mt-2 text-sm text-lifemed-600 dark:text-lifemed-400">
                      {formatDate(nextAppointment.date, locale, {
                        weekday: "long",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                    {nextAppointment.location && (
                      <p className="mt-1 text-xs text-muted">{nextAppointment.location}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted">{t("dashboard.noAppointments")}</p>
                )}
              </CardContent>
            </Link>
            {!nextAppointment && (
              <CardContent className="pt-0">
                <Button
                  variant="secondary"
                  size="sm"
                  className="relative z-10"
                  onClick={() => openAppointmentModal(null)}
                >
                  <Plus className="h-4 w-4" />
                  {t("appointments.add")}
                </Button>
              </CardContent>
            )}
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="card-hover h-full overflow-hidden">
            <DashboardCardHeader
              href="/profile"
              icon={<Pill className="h-4 w-4 text-lifemed-500" />}
              title={t("dashboard.todayMedications")}
              editLabel={t("common.edit")}
              onEdit={() =>
                openMedicationModal(profile.currentMedications[0] ?? null)
              }
            />
            <CardContent className="space-y-2">
              {profile.currentMedications.length > 0 ? (
                profile.currentMedications.map((med) => (
                  <div
                    key={med.id}
                    className="flex items-center gap-2 rounded-xl p-2 transition-colors hover:bg-surface-elevated"
                  >
                    <Link href="/profile" className="min-w-0 flex-1 no-underline text-inherit">
                      <p className="text-sm font-medium text-foreground">{med.name}</p>
                      <p className="text-xs text-muted">
                        {med.dosage} · {getMedicationFrequencyLabel(med.frequency)}
                      </p>
                      {sanitizeReminderTimes(med.reminderTimes ?? []).length > 0 ? (
                        <p className="text-xs text-lifemed-600 dark:text-lifemed-400">
                          {t("profile.reminderTimes", {
                            times: formatReminderTimes(med.reminderTimes, t("profile.noReminderTimes")),
                          })}
                        </p>
                      ) : null}
                    </Link>
                    <Badge variant="success">{t("common.active")}</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="relative z-10 h-8 w-8 shrink-0"
                      aria-label={t("common.edit")}
                      onClick={() => openMedicationModal(med)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted">{t("dashboard.noMedications")}</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="relative z-10"
                    onClick={() => openMedicationModal(null)}
                  >
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
          <Card className="overflow-hidden">
            <DashboardCardHeader
              href="/timeline"
              icon={<Clock className="h-5 w-5 text-lifemed-500" />}
              title={t("dashboard.recentTimeline")}
              editLabel={t("common.edit")}
              onEdit={() =>
                recentTimeline[0]
                  ? setEditTimelineEvent(recentTimeline[0])
                  : setShowTimelineAddModal(true)
              }
            />
            <CardContent className="space-y-4">
              {recentTimeline.length > 0 ? (
                recentTimeline.map((event, i) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className="h-3 w-3 rounded-full bg-lifemed-400 ring-4 ring-lifemed-100 dark:ring-lifemed-900/40" />
                      {i < recentTimeline.length - 1 && (
                        <div className="mt-1 w-px flex-1 bg-border" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditTimelineEvent(event)}
                      className="relative z-10 flex min-w-0 flex-1 gap-2 pb-4 text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{event.title}</span>
                          <span className={cnBadge(getTimelineTypeColor(event.type))}>
                            {getTimelineTypeLabel(event.type)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted">{formatDate(event.date, locale)}</p>
                      </div>
                      <Pencil className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border p-6 text-center">
                  <Clock className="mx-auto h-8 w-8 text-muted/50" />
                  <p className="mt-2 text-sm text-muted">{t("dashboard.noTimeline")}</p>
                  <Button
                    className="relative z-10 mt-4"
                    size="sm"
                    onClick={() => setShowTimelineAddModal(true)}
                  >
                    <Plus className="h-4 w-4" />
                    {t("dashboard.addTimelineEvent")}
                  </Button>
                </div>
              )}
            </CardContent>
            {recentTimeline.length > 0 && (
              <CardContent className="border-t border-border pt-0">
                <Button variant="ghost" size="sm" href="/timeline" className="relative z-10">
                  {t("common.viewAll")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            )}
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden">
            <DashboardCardHeader
              href="/documents"
              icon={<FileText className="h-5 w-5 text-lifemed-500" />}
              title={t("dashboard.recentUploads")}
              editLabel={t("documents.view")}
              onEdit={() => recentDocs[0] && setViewerDoc(recentDocs[0])}
            />
            <CardContent className="space-y-3">
              {recentDocs.length > 0 ? (
                recentDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-2 rounded-xl border border-border p-3 transition-colors hover:bg-surface-elevated"
                  >
                    <button
                      type="button"
                      onClick={() => setViewerDoc(doc)}
                      className="relative z-10 flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lifemed-50 text-lifemed-600 dark:bg-lifemed-950/50">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                        <p className="text-xs text-muted">
                          {getDocumentCategoryLabel(doc.category)} ·{" "}
                          {formatRelativeTime(doc.uploadedAt, locale)}
                        </p>
                      </div>
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="relative z-10 h-8 w-8 shrink-0"
                      aria-label={t("documents.view")}
                      onClick={() => setViewerDoc(doc)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border p-6 text-center">
                  <FileText className="mx-auto h-8 w-8 text-muted/50" />
                  <p className="mt-2 text-sm text-muted">{t("documents.empty")}</p>
                  <Button className="relative z-10 mt-4" size="sm" href="/documents?upload=true">
                    <Upload className="h-4 w-4" />
                    {t("dashboard.addDocument")}
                  </Button>
                </div>
              )}
            </CardContent>
            {recentDocs.length > 0 && (
              <CardContent className="border-t border-border pt-0">
                <Button variant="ghost" size="sm" href="/documents" className="relative z-10">
                  {t("common.viewAll")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            )}
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <DashboardAiPanel locale={locale} />
      </motion.div>

      <AddAppointmentModal
        open={showAppointmentModal}
        appointment={editAppointment}
        onClose={() => {
          setShowAppointmentModal(false);
          setEditAppointment(null);
        }}
      />
      <AddMedicationModal
        open={showMedicationModal}
        medication={editMedication}
        onClose={() => {
          setShowMedicationModal(false);
          setEditMedication(null);
        }}
      />
      <AddTimelineEventModal
        open={showTimelineAddModal}
        onClose={() => setShowTimelineAddModal(false)}
      />
      <EditTimelineEventModal
        open={Boolean(editTimelineEvent)}
        event={editTimelineEvent}
        onClose={() => setEditTimelineEvent(null)}
      />
      <DocumentViewerModal
        open={Boolean(viewerDoc)}
        document={viewerDoc}
        onClose={() => setViewerDoc(null)}
        resolveUrl={resolveDocumentUrl}
        onDownload={downloadDocument}
      />
    </motion.div>
  );
}

function cnBadge(className: string) {
  return `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`;
}

function DashboardCardHeader({
  href,
  icon,
  title,
  onEdit,
  editLabel,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  onEdit?: () => void;
  editLabel: string;
}) {
  return (
    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
      <Link
        href={href}
        className="flex min-w-0 flex-1 items-center gap-2 no-underline transition-colors hover:text-lifemed-600 dark:hover:text-lifemed-400"
      >
        {icon}
        <CardTitle className="text-base text-foreground">{title}</CardTitle>
      </Link>
      {onEdit && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative z-10 shrink-0"
          aria-label={editLabel}
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
    </CardHeader>
  );
}
