"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { formatDate } from "@/lib/utils";
import { displayFirstName } from "@/lib/health/empty-profile";

export default function HealthReportPage() {
  const { t, locale } = useTranslation();
  const { loading, profile, timeline, documents, appointments } = useHealthDataContext();

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("print=1")) {
      window.print();
    }
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-muted">{t("common.loading")}</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 print:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">{t("healthReport.title")}</h1>
          <p className="text-sm text-muted">{t("healthReport.subtitle")}</p>
        </div>
        <Button type="button" onClick={() => window.print()}>
          {t("healthReport.print")}
        </Button>
      </div>

      <section className="rounded-2xl border border-border p-6">
        <h2 className="text-lg font-semibold">{t("healthReport.patient")}</h2>
        <p className="mt-2">{profile.fullName || displayFirstName(profile.fullName, t("ai.you"))}</p>
        <p className="text-sm text-muted">
          {profile.dateOfBirth ? formatDate(profile.dateOfBirth, locale) : t("profile.dobMissing")}
        </p>
        <p className="text-sm text-muted">
          {t("profile.bloodType")}: {profile.bloodType || "—"}
        </p>
      </section>

      <section className="rounded-2xl border border-border p-6">
        <h2 className="text-lg font-semibold">{t("profile.allergies")}</h2>
        <p className="mt-2 text-sm">{profile.allergies.join(", ") || "—"}</p>
        <h3 className="mt-4 font-medium">{t("profile.chronic")}</h3>
        <p className="mt-1 text-sm">{profile.chronicIllnesses.join(", ") || "—"}</p>
        <h3 className="mt-4 font-medium">{t("profile.medications")}</h3>
        <ul className="mt-1 space-y-1 text-sm">
          {profile.currentMedications.map((med) => (
            <li key={med.id}>
              {med.name} · {med.dosage}
            </li>
          ))}
          {profile.currentMedications.length === 0 ? <li>—</li> : null}
        </ul>
      </section>

      <section className="rounded-2xl border border-border p-6">
        <h2 className="text-lg font-semibold">{t("healthReport.timeline")}</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {timeline.slice(-10).reverse().map((event) => (
            <li key={event.id}>
              {formatDate(event.date, locale)} · {event.title}
            </li>
          ))}
          {timeline.length === 0 ? <li>—</li> : null}
        </ul>
      </section>

      <section className="rounded-2xl border border-border p-6">
        <h2 className="text-lg font-semibold">{t("healthReport.documents")}</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {documents.slice(0, 10).map((doc) => (
            <li key={doc.id}>
              {doc.name} · {doc.category}
            </li>
          ))}
          {documents.length === 0 ? <li>—</li> : null}
        </ul>
      </section>

      <section className="rounded-2xl border border-border p-6">
        <h2 className="text-lg font-semibold">{t("healthReport.appointments")}</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {appointments.slice(0, 5).map((apt) => (
            <li key={apt.id}>
              {formatDate(apt.date, locale, { hour: "numeric", minute: "2-digit" })} · {apt.title}
            </li>
          ))}
          {appointments.length === 0 ? <li>—</li> : null}
        </ul>
      </section>

      <p className="text-xs text-muted">{t("disclaimers.medical")}</p>
    </div>
  );
}
