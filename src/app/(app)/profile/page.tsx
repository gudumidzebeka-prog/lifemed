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
import { normalizeDateOfBirth } from "@/lib/health/profile-dates";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { AddMedicationModal } from "@/components/profile/add-medication-modal";
import { EmergencyContactModal } from "@/components/profile/emergency-contact-modal";
import {
  MedicalShareQr,
  MedicalShareQrBottomSection,
} from "@/components/share/medical-share-qr";
import type { EmergencyContact, Medication } from "@/types/health";
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
    saveProfile,
    addAllergy,
    removeAllergy,
    addChronicIllness,
    removeChronicIllness,
    removeEmergencyContact,
    removeMedication,
  } = useHealthDataContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMedModal, setShowMedModal] = useState(false);
  const [editMedication, setEditMedication] = useState<Medication | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editContact, setEditContact] = useState<EmergencyContact | null>(null);
  const [newAllergy, setNewAllergy] = useState("");
  const [newChronic, setNewChronic] = useState("");
  const [bloodTypeInput, setBloodTypeInput] = useState(profile.bloodType ?? "");
  const [personalForm, setPersonalForm] = useState({
    fullName: profile.fullName,
    dateOfBirth: normalizeDateOfBirth(profile.dateOfBirth),
  });
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingBloodType, setSavingBloodType] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const openMedicationModal = (medication: Medication | null = null) => {
    setEditMedication(medication);
    setShowMedModal(true);
  };

  const closeMedicationModal = () => {
    setShowMedModal(false);
    setEditMedication(null);
  };

  const openContactModal = (contact: EmergencyContact | null = null) => {
    setEditContact(contact);
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setEditContact(null);
  };

  useEffect(() => {
    setPersonalForm({
      fullName: profile.fullName,
      dateOfBirth: normalizeDateOfBirth(profile.dateOfBirth),
    });
    setBloodTypeInput(profile.bloodType ?? "");
  }, [profile.fullName, profile.dateOfBirth, profile.bloodType]);

  useEffect(() => {
    if (searchParams.get("med") === "true") {
      openMedicationModal(null);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("allergies") !== "true") return;
    const timer = window.setTimeout(() => {
      document.getElementById("profile-allergies")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [searchParams]);

  const handleAddAllergy = async () => {
    if (!newAllergy.trim()) return;
    await addAllergy(newAllergy.trim());
    setNewAllergy("");
  };

  const handleAddChronic = async () => {
    if (!newChronic.trim()) return;
    const { error } = await addChronicIllness(newChronic.trim());
    if (error) {
      setFieldError(error);
      return;
    }
    setNewChronic("");
    setFieldError(null);
  };

  const handleSaveFullName = async () => {
    if (loading || personalForm.fullName.trim() === profile.fullName.trim()) return;

    setSavingPersonal(true);
    setFieldError(null);
    const { error } = await saveProfile({ fullName: personalForm.fullName.trim() });
    setSavingPersonal(false);
    if (error) setFieldError(error);
  };

  const handleDateOfBirthChange = async (value: string) => {
    setPersonalForm((prev) => ({ ...prev, dateOfBirth: value }));
    if (value.length !== 10 || loading) return;

    const normalized = normalizeDateOfBirth(value);
    if (!normalized || normalized === normalizeDateOfBirth(profile.dateOfBirth)) return;

    const { error } = await saveProfile({ dateOfBirth: normalized });
    if (error) setFieldError(error);
  };

  const handleSaveBloodType = async () => {
    if (loading) return;

    const nextValue = bloodTypeInput.trim();
    if (nextValue === (profile.bloodType ?? "")) return;

    setSavingBloodType(true);
    setFieldError(null);
    const { error } = await saveProfile({ bloodType: nextValue });
    setSavingBloodType(false);
    if (error) setFieldError(error);
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
      <AddMedicationModal
        open={showMedModal}
        onClose={closeMedicationModal}
        medication={editMedication}
      />
      <EmergencyContactModal
        open={showContactModal}
        onClose={closeContactModal}
        contact={editContact}
      />

      <Card>
        <CardContent className="flex items-start gap-3 p-6 sm:gap-4 sm:p-8">
          <ProfileAvatar
            fullName={profile.fullName}
            avatarUrl={profile.avatarUrl}
            editable
          />
          <div className="text-left flex-1 min-w-0">
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
            <div className="mt-3 flex flex-wrap gap-2 justify-start">
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
          <MedicalShareQr
            size="sm"
            title={t("profile.medicalQrTitle")}
            className="shrink-0"
          />
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
            {fieldError && <p className="text-sm text-rose-600">{fieldError}</p>}
            <Input
              label={t("profile.fullName")}
              value={personalForm.fullName}
              onChange={(e) => setPersonalForm({ ...personalForm, fullName: e.target.value })}
              onBlur={handleSaveFullName}
            />
            <Input
              label={t("profile.dob")}
              type="date"
              value={personalForm.dateOfBirth}
              onChange={(e) => handleDateOfBirthChange(e.target.value)}
            />
            {savingPersonal && <p className="text-xs text-muted">{t("common.saving")}</p>}
          </CardContent>
        </Card>

        <ExpandableCard
          title={t("profile.bloodType")}
          subtitle={profile.bloodType || t("profile.bloodTypeMissing")}
          icon={<Droplets className="h-5 w-5" />}
          defaultOpen
        >
          {profile.bloodType ? (
            <Badge variant="info" className="gap-1">
              <Droplets className="h-3 w-3" />
              {profile.bloodType}
            </Badge>
          ) : (
            <p className="text-sm text-muted">{t("profile.bloodTypeMissing")}</p>
          )}
          <div className="mt-3 flex gap-2">
            <Input
              placeholder={t("profile.bloodTypePlaceholder")}
              value={bloodTypeInput}
              onChange={(e) => setBloodTypeInput(e.target.value)}
              onBlur={handleSaveBloodType}
              onKeyDown={(e) => e.key === "Enter" && handleSaveBloodType()}
            />
            <Button
              type="button"
              size="sm"
              className="relative z-10 shrink-0"
              onClick={handleSaveBloodType}
              disabled={savingBloodType}
            >
              {savingBloodType ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </ExpandableCard>

        <ExpandableCard
          id="profile-allergies"
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
                  className="relative z-10 ml-1 rounded-full p-0.5 hover:bg-rose-200/50"
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
            <Button type="button" size="sm" className="relative z-10 shrink-0" onClick={handleAddAllergy}>
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
              <div key={med.id} className="flex items-start justify-between gap-2 rounded-xl border border-border p-3 transition-colors hover:bg-surface-elevated">
                <button
                  type="button"
                  onClick={() => openMedicationModal(med)}
                  className="relative z-10 min-w-0 flex-1 text-left"
                  aria-label={t("common.edit")}
                >
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
                </button>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative z-10"
                    onClick={() => openMedicationModal(med)}
                    aria-label={t("common.edit")}
                  >
                    <Pencil className="h-4 w-4 text-muted" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => removeMedication(med.id)}>
                    <Trash2 className="h-4 w-4 text-muted" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => openMedicationModal(null)}>
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
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="text-sm text-lifemed-600 dark:text-lifemed-400 mt-1 inline-block hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openContactModal(contact)}
                    aria-label={t("common.edit")}
                  >
                    <Pencil className="h-4 w-4 text-muted" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => removeEmergencyContact(contact.id)}>
                    <Trash2 className="h-4 w-4 text-muted" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => openContactModal(null)}>
            <Plus className="h-4 w-4" />
            {t("profile.addContact")}
          </Button>
        </ExpandableCard>

        <ExpandableCard
          id="profile-chronic"
          title={t("profile.chronic")}
          subtitle={t("profile.chronicCount", { count: profile.chronicIllnesses.length })}
          icon={<Heart className="h-5 w-5" />}
          defaultOpen
        >
          {profile.chronicIllnesses.length === 0 ? (
            <p className="text-sm text-muted">{t("profile.chronicEmpty")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.chronicIllnesses.map((illness) => (
                <Badge key={illness} variant="warning" className="gap-1 pr-1">
                  {illness}
                  <button
                    type="button"
                    onClick={() => removeChronicIllness(illness)}
                    className="relative z-10 ml-1 rounded-full p-0.5 hover:bg-amber-200/50"
                    aria-label={`${t("common.remove")} ${illness}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <Input
              placeholder={t("profile.newChronicPlaceholder")}
              value={newChronic}
              onChange={(e) => setNewChronic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddChronic()}
            />
            <Button type="button" size="sm" className="relative z-10 shrink-0" onClick={handleAddChronic}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </ExpandableCard>
      </div>

      <MedicalShareQrBottomSection className="mt-4" />
    </div>
  );
}
