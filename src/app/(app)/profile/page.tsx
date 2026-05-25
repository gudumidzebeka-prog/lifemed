"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExpandableCard } from "@/components/ui/expandable-card";
import { useMedicationFrequencyLabel, useRelationshipLabel } from "@/lib/i18n/hooks";
import { formatDate } from "@/lib/utils";
import { formatReminderTimes, sanitizeReminderTimes } from "@/lib/health/medication-reminders";
import { displayFirstName } from "@/lib/health/empty-profile";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { AddMedicationModal } from "@/components/profile/add-medication-modal";
import { EmergencyContactModal } from "@/components/profile/emergency-contact-modal";
import {
  User,
  Droplets,
  AlertTriangle,
  Pill,
  Phone,
  Heart,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

export default function ProfilePage() {
  const { t } = useTranslation();

  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">{t("common.loading")}</div>}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();
  const getMedicationFrequencyLabel = useMedicationFrequencyLabel();
  const getRelationshipLabel = useRelationshipLabel();
  const {
    loading,
    profile,
    addAllergy,
    removeAllergy,
    removeEmergencyContact,
    removeMedication,
  } = useHealthDataContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMedModal, setShowMedModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [newAllergy, setNewAllergy] = useState("");

  useEffect(() => {
    if (searchParams.get("med") === "true") {
      setShowMedModal(true);
    }
  }, [searchParams]);

  const handleAddAllergy = async () => {
    if (!newAllergy.trim()) return;
    await addAllergy(newAllergy.trim());
    setNewAllergy("");
  };

  if (loading) {
    return <div className="py-20 text-center text-muted">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("profile.title")}</h1>
          <p className="mt-1 text-muted">{t("profile.subtitle")}</p>
        </div>
        <Button variant="secondary" onClick={() => setShowEditModal(true)}>
          <Pencil className="h-4 w-4" />
          {t("profile.editProfile")}
        </Button>
      </div>

      <EditProfileModal open={showEditModal} onClose={() => setShowEditModal(false)} />
      <AddMedicationModal open={showMedModal} onClose={() => setShowMedModal(false)} />
      <EmergencyContactModal open={showContactModal} onClose={() => setShowContactModal(false)} />

      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 sm:flex-row sm:items-start">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl gradient-primary text-3xl font-bold text-white shadow-lg shadow-lifemed-500/20">
            {(profile.fullName.trim() || displayFirstName(profile.fullName))
              .split(/\s+/)
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {profile.fullName.trim() || displayFirstName(profile.fullName)}
            </h2>
            <p className="text-muted mt-1">
              {profile.dateOfBirth
                ? t("profile.born", {
                    date: formatDate(profile.dateOfBirth, locale, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }),
                  })
                : t("profile.dobMissing")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
              {profile.bloodType && (
                <Badge variant="info">
                  <Droplets className="h-3 w-3" />
                  {profile.bloodType}
                </Badge>
              )}
              {profile.chronicIllnesses.map((illness) => (
                <Badge key={illness} variant="warning">
                  {illness}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-lifemed-500" />
              {t("profile.personalDetails")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label={t("profile.fullName")} defaultValue={profile.fullName} readOnly />
            <Input label={t("profile.dob")} defaultValue={profile.dateOfBirth} type="date" readOnly />
            <Input label={t("profile.bloodType")} defaultValue={profile.bloodType} readOnly />
          </CardContent>
        </Card>

        <ExpandableCard
          title={t("profile.allergies")}
          subtitle={t("profile.allergiesKnown", { count: profile.allergies.length })}
          icon={<AlertTriangle className="h-5 w-5" />}
          defaultOpen
        >
          <div className="flex flex-wrap gap-2">
            {profile.allergies.map((allergy) => (
              <Badge key={allergy} variant="danger" className="gap-1 pr-1">
                {allergy}
                <button
                  type="button"
                  onClick={() => removeAllergy(allergy)}
                  className="ml-1 rounded-full p-0.5 hover:bg-rose-200/50"
                  aria-label={`${t("common.remove")} ${allergy}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder={t("profile.newAllergyPlaceholder")}
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddAllergy()}
            />
            <Button type="button" size="sm" onClick={handleAddAllergy}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </ExpandableCard>

        <ExpandableCard
          title={t("profile.medications")}
          subtitle={t("profile.medicationsActive", { count: profile.currentMedications.length })}
          icon={<Pill className="h-5 w-5" />}
          defaultOpen
        >
          <div className="space-y-3">
            {profile.currentMedications.length === 0 && (
              <p className="text-sm text-muted">{t("profile.medicationsEmpty")}</p>
            )}
            {profile.currentMedications.map((med) => (
              <div key={med.id} className="flex items-start justify-between gap-2 rounded-xl border border-border p-3">
                <div>
                  <p className="font-medium text-foreground">{med.name}</p>
                  <p className="text-sm text-muted">
                    {med.dosage} · {getMedicationFrequencyLabel(med.frequency)}
                  </p>
                  {sanitizeReminderTimes(med.reminderTimes ?? []).length > 0 ? (
                    <p className="text-xs text-lifemed-600 dark:text-lifemed-400 mt-1">
                      {t("profile.reminderTimes", {
                        times: formatReminderTimes(med.reminderTimes, t("profile.noReminderTimes")),
                      })}
                    </p>
                  ) : null}
                  {med.prescriber && (
                    <p className="text-xs text-muted mt-1">
                      {t("profile.prescribedBy", { prescriber: med.prescriber })}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeMedication(med.id)}>
                  <Trash2 className="h-4 w-4 text-muted" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => setShowMedModal(true)}>
            <Plus className="h-4 w-4" />
            {t("profile.addMedication")}
          </Button>
        </ExpandableCard>

        <ExpandableCard
          title={t("profile.contacts")}
          subtitle={t("profile.contactsCount", { count: profile.emergencyContacts.length })}
          icon={<Phone className="h-5 w-5" />}
          defaultOpen
        >
          <div className="space-y-3">
            {profile.emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex items-start justify-between gap-2 rounded-xl border border-border p-3">
                <div>
                  <p className="font-medium text-foreground">{contact.name}</p>
                  <p className="text-sm text-muted">{getRelationshipLabel(contact.relationship)}</p>
                  <p className="text-sm text-lifemed-600 dark:text-lifemed-400 mt-1">{contact.phone}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeEmergencyContact(contact.id)}>
                  <Trash2 className="h-4 w-4 text-muted" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => setShowContactModal(true)}>
            <Plus className="h-4 w-4" />
            {t("profile.addContact")}
          </Button>
        </ExpandableCard>

        <ExpandableCard
          title={t("profile.chronic")}
          subtitle={t("profile.chronicCount", { count: profile.chronicIllnesses.length })}
          icon={<Heart className="h-5 w-5" />}
        >
          <ul className="space-y-2">
            {profile.chronicIllnesses.map((illness) => (
              <li key={illness} className="text-sm text-foreground">
                • {illness}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted mt-3">{t("profile.chronicEditHint")}</p>
        </ExpandableCard>
      </div>
    </div>
  );
}
