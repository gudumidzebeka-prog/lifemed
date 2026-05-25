"use client";

import { useState } from "react";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { AddMedicationModal } from "@/components/profile/add-medication-modal";
import { EmergencyContactModal } from "@/components/profile/emergency-contact-modal";
import { useMedicationFrequencyLabel, useRelationshipLabel } from "@/lib/i18n/hooks";
import { displayFirstName } from "@/lib/health/empty-profile";
import { formatDate } from "@/lib/utils";
import { Phone, Mail, AlertTriangle, Pill, Heart, Droplets, Pencil, Plus, X } from "lucide-react";

export default function EmergencyPage() {
  const { t, locale } = useTranslation();
  const getMedicationFrequencyLabel = useMedicationFrequencyLabel();
  const getRelationshipLabel = useRelationshipLabel();
  const {
    loading,
    profile,
    addAllergy,
    removeAllergy,
    removeMedication,
    removeEmergencyContact,
  } = useHealthDataContext();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showMedModal, setShowMedModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [newAllergy, setNewAllergy] = useState("");

  const displayName = profile.fullName.trim() || displayFirstName(profile.fullName);

  const handleAddAllergy = async () => {
    if (!newAllergy.trim()) return;
    await addAllergy(newAllergy.trim());
    setNewAllergy("");
  };

  const cardIncomplete =
    !profile.fullName.trim() ||
    !profile.bloodType ||
    profile.allergies.length === 0 ||
    profile.emergencyContacts.length === 0;

  if (loading) {
    return <div className="py-20 text-center text-muted">{t("common.loading")}</div>;
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col">
      <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 p-6 text-white shadow-lg shadow-rose-500/20 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{t("emergency.title")}</h1>
              <p className="text-rose-100 text-sm mt-0.5">{t("emergency.subtitle")}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="relative z-10 w-full border-white/30 bg-white/15 text-white hover:bg-white/25 sm:w-auto"
            onClick={() => setShowEditModal(true)}
          >
            <Pencil className="h-4 w-4" />
            {t("emergency.fillCard")}
          </Button>
        </div>
      </div>

      {cardIncomplete && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
          <p className="text-sm text-amber-900 dark:text-amber-100">{t("emergency.fillHint")}</p>
        </div>
      )}

      <EditProfileModal open={showEditModal} onClose={() => setShowEditModal(false)} />
      <AddMedicationModal open={showMedModal} onClose={() => setShowMedModal(false)} />
      <EmergencyContactModal open={showContactModal} onClose={() => setShowContactModal(false)} />

      <div className="flex-1 space-y-4">
        <EmergencySection
          title={t("emergency.patient")}
          icon={<Heart className="h-5 w-5" />}
          action={
            <Button variant="ghost" size="sm" className="relative z-10 -mr-2 h-8" onClick={() => setShowEditModal(true)}>
              <Pencil className="h-3.5 w-3.5" />
              {t("emergency.edit")}
            </Button>
          }
        >
          <p className="text-2xl font-bold text-foreground">{displayName}</p>
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

        <EmergencySection
          title={t("emergency.bloodType")}
          icon={<Droplets className="h-5 w-5" />}
          highlight
          action={
            <Button variant="ghost" size="sm" className="relative z-10 -mr-2 h-8" onClick={() => setShowEditModal(true)}>
              <Pencil className="h-3.5 w-3.5" />
              {t("emergency.edit")}
            </Button>
          }
        >
          <p className="text-4xl font-bold text-rose-600 dark:text-rose-400">
            {profile.bloodType || t("common.unknown")}
          </p>
        </EmergencySection>

        <EmergencySection
          title={t("emergency.allergies")}
          icon={<AlertTriangle className="h-5 w-5" />}
          urgent
        >
          {profile.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.allergies.map((allergy) => (
                <Badge key={allergy} variant="danger" className="gap-1 pr-1">
                  {allergy}
                  <button
                    type="button"
                    onClick={() => removeAllergy(allergy)}
                    className="relative z-10 ml-1 rounded-full p-0.5 hover:bg-rose-200/50"
                    aria-label={`${t("common.remove")} ${allergy}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted mb-3">{t("emergency.noAllergies")}</p>
          )}
          <div className="mt-3 flex gap-2">
            <Input
              placeholder={t("profile.newAllergyPlaceholder")}
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddAllergy()}
            />
            <Button type="button" size="sm" className="relative z-10 shrink-0" onClick={handleAddAllergy}>
              <Plus className="h-4 w-4" />
              {t("emergency.add")}
            </Button>
          </div>
        </EmergencySection>

        <EmergencySection
          title={t("emergency.chronic")}
          icon={<Heart className="h-5 w-5" />}
          action={
            <Button variant="ghost" size="sm" className="relative z-10 -mr-2 h-8" onClick={() => setShowEditModal(true)}>
              <Pencil className="h-3.5 w-3.5" />
              {t("emergency.edit")}
            </Button>
          }
        >
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

        <EmergencySection
          title={t("emergency.medications")}
          icon={<Pill className="h-5 w-5" />}
          action={
            <Button variant="ghost" size="sm" className="relative z-10 -mr-2 h-8" onClick={() => setShowMedModal(true)}>
              <Plus className="h-3.5 w-3.5" />
              {t("emergency.add")}
            </Button>
          }
        >
          {profile.currentMedications.length > 0 ? (
            <div className="space-y-3">
              {profile.currentMedications.map((med) => (
                <div key={med.id} className="flex items-start justify-between gap-2 border-l-2 border-lifemed-400 pl-3">
                  <div>
                    <p className="font-medium text-foreground">{med.name}</p>
                    <p className="text-sm text-muted">
                      {med.dosage} · {getMedicationFrequencyLabel(med.frequency)}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="relative z-10 shrink-0" onClick={() => removeMedication(med.id)}>
                    <X className="h-4 w-4 text-muted" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-muted">{t("emergency.noMedications")}</p>
              <Button variant="secondary" size="sm" className="relative z-10" onClick={() => setShowMedModal(true)}>
                <Plus className="h-4 w-4" />
                {t("emergency.addMedication")}
              </Button>
            </div>
          )}
        </EmergencySection>

        <EmergencySection
          title={t("emergency.contacts")}
          icon={<Phone className="h-5 w-5" />}
          action={
            <Button variant="ghost" size="sm" className="relative z-10 -mr-2 h-8" onClick={() => setShowContactModal(true)}>
              <Plus className="h-3.5 w-3.5" />
              {t("emergency.add")}
            </Button>
          }
        >
          {profile.emergencyContacts.length > 0 ? (
            <div className="space-y-4">
              {profile.emergencyContacts.map((contact) => (
                <div key={contact.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{contact.name}</p>
                      <p className="text-sm text-muted">{getRelationshipLabel(contact.relationship)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative z-10 shrink-0"
                      onClick={() => removeEmergencyContact(contact.id)}
                    >
                      <X className="h-4 w-4 text-muted" />
                    </Button>
                  </div>
                  <a
                    href={`tel:${contact.phone.replace(/\D/g, "")}`}
                    className="relative z-10 mt-2 flex items-center gap-2 font-medium text-lifemed-600 dark:text-lifemed-400"
                  >
                    <Phone className="h-4 w-4" />
                    {contact.phone}
                  </a>
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="relative z-10 mt-1 flex items-center gap-2 text-sm text-muted"
                    >
                      <Mail className="h-4 w-4" />
                      {contact.email}
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-muted">{t("emergency.noContacts")}</p>
              <Button variant="secondary" size="sm" className="relative z-10" onClick={() => setShowContactModal(true)}>
                <Plus className="h-4 w-4" />
                {t("emergency.addContact")}
              </Button>
            </div>
          )}
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
  action,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  highlight?: boolean;
  urgent?: boolean;
  action?: React.ReactNode;
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
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-muted">
          {icon}
          <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
