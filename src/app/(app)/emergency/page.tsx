"use client";

import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { DataModeBanner } from "@/components/layout/data-mode-banner";
import { useMedicationFrequencyLabel, useRelationshipLabel } from "@/lib/i18n/hooks";
import { formatDate } from "@/lib/utils";
import { Phone, Mail, AlertTriangle, Pill, Heart, Droplets } from "lucide-react";

export default function EmergencyPage() {
  const { t, locale } = useTranslation();
  const getMedicationFrequencyLabel = useMedicationFrequencyLabel();
  const getRelationshipLabel = useRelationshipLabel();
  const { mode, loading, profile } = useHealthDataContext();

  if (loading) {
    return <div className="py-20 text-center text-muted">{t("common.loading")}</div>;
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col">
      <DataModeBanner mode={mode} />
      <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 p-6 text-white shadow-lg shadow-rose-500/20 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t("emergency.title")}</h1>
            <p className="text-rose-100 text-sm mt-0.5">{t("emergency.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <EmergencySection title={t("emergency.patient")} icon={<Heart className="h-5 w-5" />}>
          <p className="text-2xl font-bold text-foreground">{profile.fullName}</p>
          <p className="text-muted mt-1">
            {t("emergency.dob")}{" "}
            {profile.dateOfBirth
              ? formatDate(profile.dateOfBirth, locale, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : t("common.unknown")}
          </p>
        </EmergencySection>

        <EmergencySection title={t("emergency.bloodType")} icon={<Droplets className="h-5 w-5" />} highlight>
          <p className="text-4xl font-bold text-rose-600 dark:text-rose-400">
            {profile.bloodType || t("common.unknown")}
          </p>
        </EmergencySection>

        <EmergencySection title={t("emergency.allergies")} icon={<AlertTriangle className="h-5 w-5" />} urgent>
          {profile.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.allergies.map((allergy) => (
                <span
                  key={allergy}
                  className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                >
                  {allergy}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted">{t("emergency.noAllergies")}</p>
          )}
        </EmergencySection>

        <EmergencySection title={t("emergency.chronic")} icon={<Heart className="h-5 w-5" />}>
          {profile.chronicIllnesses.length > 0 ? (
            <ul className="space-y-1">
              {profile.chronicIllnesses.map((illness) => (
                <li key={illness} className="font-medium text-foreground">
                  • {illness}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">{t("emergency.noneReported")}</p>
          )}
        </EmergencySection>

        <EmergencySection title={t("emergency.medications")} icon={<Pill className="h-5 w-5" />}>
          <div className="space-y-3">
            {profile.currentMedications.map((med) => (
              <div key={med.id} className="border-l-2 border-lifemed-400 pl-3">
                <p className="font-medium text-foreground">{med.name}</p>
                <p className="text-sm text-muted">
                  {med.dosage} · {getMedicationFrequencyLabel(med.frequency)}
                </p>
              </div>
            ))}
          </div>
        </EmergencySection>

        <EmergencySection title={t("emergency.contacts")} icon={<Phone className="h-5 w-5" />}>
          <div className="space-y-4">
            {profile.emergencyContacts.map((contact) => (
              <div key={contact.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{contact.name}</p>
                    <p className="text-sm text-muted">{getRelationshipLabel(contact.relationship)}</p>
                  </div>
                </div>
                <a
                  href={`tel:${contact.phone.replace(/\D/g, "")}`}
                  className="mt-2 flex items-center gap-2 text-lifemed-600 dark:text-lifemed-400 font-medium"
                >
                  <Phone className="h-4 w-4" />
                  {contact.phone}
                </a>
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="mt-1 flex items-center gap-2 text-sm text-muted"
                  >
                    <Mail className="h-4 w-4" />
                    {contact.email}
                  </a>
                )}
              </div>
            ))}
          </div>
        </EmergencySection>
      </div>

      <p className="mt-8 text-center text-xs text-muted pb-4">{t("emergency.footer")}</p>
    </div>
  );
}

function EmergencySection({
  title,
  icon,
  children,
  highlight,
  urgent,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  highlight?: boolean;
  urgent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        urgent
          ? "border-rose-200 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-950/20"
          : highlight
            ? "border-lifemed-200 bg-lifemed-50/50 dark:border-lifemed-800 dark:bg-lifemed-950/20"
            : "border-border bg-surface"
      }`}
    >
      <div className="flex items-center gap-2 mb-3 text-muted">
        {icon}
        <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  );
}
