"use client";

import { useState } from "react";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AddMedicationModal } from "@/components/profile/add-medication-modal";
import { EmergencyContactModal } from "@/components/profile/emergency-contact-modal";
import {
  MedicalShareQr,
  MedicalShareQrBottomSection,
  MedicalShareQrStickyBar,
} from "@/components/share/medical-share-qr";
import { useMedicationFrequencyLabel, useRelationshipLabel } from "@/lib/i18n/hooks";
import { displayFirstName } from "@/lib/health/empty-profile";
import { normalizeDateOfBirth } from "@/lib/health/profile-dates";
import { formatDate } from "@/lib/utils";
import { formatReminderTimes, sanitizeReminderTimes } from "@/lib/health/medication-reminders";
import type { EmergencyContact, Medication } from "@/types/health";
import { Phone, Mail, AlertTriangle, Pill, Heart, Droplets, Pencil, Plus, X } from "lucide-react";

export default function EmergencyPage() {
  const { t, locale } = useTranslation();
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
    removeMedication,
    removeEmergencyContact,
  } = useHealthDataContext();

  const [showMedModal, setShowMedModal] = useState(false);
  const [editMedication, setEditMedication] = useState<Medication | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editContact, setEditContact] = useState<EmergencyContact | null>(null);

  const [editingPatient, setEditingPatient] = useState(false);
  const [patientForm, setPatientForm] = useState({
    fullName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
  });
  const [savingPatient, setSavingPatient] = useState(false);

  const [editingBloodType, setEditingBloodType] = useState(false);
  const [bloodTypeInput, setBloodTypeInput] = useState("");
  const [savingBloodType, setSavingBloodType] = useState(false);

  const [editingAllergies, setEditingAllergies] = useState(false);
  const [newAllergy, setNewAllergy] = useState("");

  const [editingChronic, setEditingChronic] = useState(false);
  const [newChronic, setNewChronic] = useState("");

  const [editingMedications, setEditingMedications] = useState(false);
  const [editingContacts, setEditingContacts] = useState(false);

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

  const displayName = profile.fullName.trim() || displayFirstName(profile.fullName);

  const openPatientEditor = () => {
    setPatientForm({
      fullName: profile.fullName,
      dateOfBirth: normalizeDateOfBirth(profile.dateOfBirth),
      email: profile.email ?? "",
      phone: profile.phone ?? "",
    });
    setEditingPatient(true);
  };

  const handleSavePatient = async () => {
    setSavingPatient(true);
    const updates: {
      fullName: string;
      email: string;
      phone: string;
      dateOfBirth?: string;
    } = {
      fullName: patientForm.fullName.trim(),
      email: patientForm.email.trim(),
      phone: patientForm.phone.trim(),
    };

    if (patientForm.dateOfBirth) {
      updates.dateOfBirth = normalizeDateOfBirth(patientForm.dateOfBirth);
    }

    const { error } = await saveProfile(updates);
    setSavingPatient(false);
    if (!error) {
      setEditingPatient(false);
    }
  };

  const openBloodTypeEditor = () => {
    setBloodTypeInput(profile.bloodType ?? "");
    setEditingBloodType(true);
  };

  const handleSaveBloodType = async () => {
    setSavingBloodType(true);
    const { error } = await saveProfile({ bloodType: bloodTypeInput.trim() });
    setSavingBloodType(false);
    if (!error) {
      setEditingBloodType(false);
    }
  };

  const handleAddAllergy = async () => {
    if (!newAllergy.trim()) return;
    await addAllergy(newAllergy.trim());
    setNewAllergy("");
  };

  const handleAddChronic = async () => {
    if (!newChronic.trim()) return;
    await addChronicIllness(newChronic.trim());
    setNewChronic("");
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold">{t("emergency.title")}</h1>
              <p className="text-rose-100 text-sm mt-0.5">{t("emergency.subtitle")}</p>
            </div>
          </div>
          <MedicalShareQr
            size="sm"
            title={t("profile.medicalQrTitle")}
            variant="light"
            className="hidden sm:block"
          />
        </div>
        <div className="mt-4 sm:hidden flex justify-center">
          <MedicalShareQr size="sm" title={t("profile.medicalQrTitle")} variant="light" />
        </div>
      </div>

      {cardIncomplete && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
          <p className="text-sm text-amber-900 dark:text-amber-100">{t("emergency.fillHint")}</p>
        </div>
      )}

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

      <div className="flex-1 space-y-4">
        <EmergencySection
          title={t("emergency.patient")}
          icon={<Heart className="h-5 w-5" />}
          action={
            <SectionEditButton
              label={t("emergency.edit")}
              onClick={openPatientEditor}
            />
          }
        >
          {!editingPatient ? (
            <>
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
              {(profile.email || profile.phone) && (
                <div className="mt-2 space-y-1 text-sm text-muted">
                  {profile.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {profile.email}
                    </p>
                  )}
                  {profile.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {profile.phone}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <Input
                label={t("profile.fullName")}
                value={patientForm.fullName}
                onChange={(e) => setPatientForm({ ...patientForm, fullName: e.target.value })}
              />
              <Input
                label={t("profile.dob")}
                type="date"
                value={patientForm.dateOfBirth}
                onChange={(e) => setPatientForm({ ...patientForm, dateOfBirth: e.target.value })}
              />
              <Input
                label={t("modals.profileEmail")}
                type="email"
                placeholder={t("modals.profileEmailPlaceholder")}
                value={patientForm.email}
                onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
              />
              <Input
                label={t("modals.profilePhone")}
                type="tel"
                placeholder={t("modals.profilePhonePlaceholder")}
                value={patientForm.phone}
                onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
              />
              <Button
                type="button"
                size="sm"
                className="relative z-10"
                onClick={handleSavePatient}
                disabled={savingPatient}
              >
                {savingPatient ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          )}
        </EmergencySection>

        <EmergencySection
          title={t("emergency.bloodType")}
          icon={<Droplets className="h-5 w-5" />}
          highlight
          action={
            <SectionEditButton
              label={t("emergency.edit")}
              onClick={openBloodTypeEditor}
            />
          }
        >
          <p className="text-4xl font-bold text-rose-600 dark:text-rose-400">
            {profile.bloodType || t("common.unknown")}
          </p>
          {editingBloodType && (
            <div className="mt-3 flex gap-2">
              <Input
                placeholder={t("profile.bloodTypePlaceholder")}
                value={bloodTypeInput}
                onChange={(e) => setBloodTypeInput(e.target.value)}
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
          )}
        </EmergencySection>

        <EmergencySection
          title={t("emergency.allergies")}
          icon={<AlertTriangle className="h-5 w-5" />}
          urgent
          action={
            <SectionEditButton
              label={t("emergency.edit")}
              onClick={() => setEditingAllergies(true)}
            />
          }
        >
          {profile.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.allergies.map((allergy) => (
                <Badge key={allergy} variant="danger" className="gap-1 pr-1">
                  {allergy}
                  {editingAllergies && (
                    <button
                      type="button"
                      onClick={() => removeAllergy(allergy)}
                      className="relative z-10 ml-1 rounded-full p-0.5 hover:bg-rose-200/50"
                      aria-label={`${t("common.remove")} ${allergy}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted">{t("emergency.noAllergies")}</p>
          )}
          {editingAllergies && (
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
          )}
        </EmergencySection>

        <EmergencySection
          title={t("emergency.chronic")}
          icon={<Heart className="h-5 w-5" />}
          action={
            <SectionEditButton
              label={t("emergency.edit")}
              onClick={() => setEditingChronic(true)}
            />
          }
        >
          {profile.chronicIllnesses.length > 0 ? (
            editingChronic ? (
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
            ) : (
              <ul className="space-y-1">
                {profile.chronicIllnesses.map((illness) => (
                  <li key={illness} className="font-medium text-foreground">
                    • {illness}
                  </li>
                ))}
              </ul>
            )
          ) : (
            <p className="text-muted">{t("emergency.noneReported")}</p>
          )}
          {editingChronic && (
            <div className="mt-3 flex gap-2">
              <Input
                placeholder={t("profile.newChronicPlaceholder")}
                value={newChronic}
                onChange={(e) => setNewChronic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddChronic()}
              />
              <Button type="button" size="sm" className="relative z-10 shrink-0" onClick={handleAddChronic}>
                <Plus className="h-4 w-4" />
                {t("emergency.add")}
              </Button>
            </div>
          )}
        </EmergencySection>

        <EmergencySection
          title={t("emergency.medications")}
          icon={<Pill className="h-5 w-5" />}
          action={
            <SectionEditButton
              label={t("emergency.edit")}
              onClick={() => setEditingMedications(true)}
            />
          }
        >
          {profile.currentMedications.length > 0 ? (
            <div className="space-y-3">
              {profile.currentMedications.map((med) => (
                <div key={med.id} className="flex items-start justify-between gap-2 border-l-2 border-lifemed-400 pl-3">
                  {editingMedications ? (
                    <>
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
                      </button>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative z-10 h-8 w-8"
                          onClick={() => openMedicationModal(med)}
                          aria-label={t("common.edit")}
                        >
                          <Pencil className="h-4 w-4 text-muted" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative z-10 shrink-0"
                          onClick={() => removeMedication(med.id)}
                        >
                          <X className="h-4 w-4 text-muted" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="min-w-0 flex-1">
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
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">{t("emergency.noMedications")}</p>
          )}
          {editingMedications && (
            <Button
              variant="secondary"
              size="sm"
              className="relative z-10 mt-3"
              onClick={() => openMedicationModal(null)}
            >
              <Plus className="h-4 w-4" />
              {t("emergency.addMedication")}
            </Button>
          )}
        </EmergencySection>

        <EmergencySection
          title={t("emergency.contacts")}
          icon={<Phone className="h-5 w-5" />}
          action={
            <SectionEditButton
              label={t("emergency.edit")}
              onClick={() => setEditingContacts(true)}
            />
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
                    {editingContacts && (
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative z-10 h-8 w-8"
                          onClick={() => openContactModal(contact)}
                          aria-label={t("common.edit")}
                        >
                          <Pencil className="h-4 w-4 text-muted" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative z-10 shrink-0"
                          onClick={() => removeEmergencyContact(contact.id)}
                          aria-label={t("common.remove")}
                        >
                          <X className="h-4 w-4 text-muted" />
                        </Button>
                      </div>
                    )}
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
            <p className="text-muted">{t("emergency.noContacts")}</p>
          )}
          {editingContacts && (
            <Button
              variant="secondary"
              size="sm"
              className="relative z-10 mt-3"
              onClick={() => openContactModal(null)}
            >
              <Plus className="h-4 w-4" />
              {t("emergency.addContact")}
            </Button>
          )}
        </EmergencySection>
      </div>

      <MedicalShareQrBottomSection className="mt-4" />
      <MedicalShareQrStickyBar />

      <p className="mt-8 text-center text-xs text-muted pb-4">{t("emergency.footer")}</p>
    </div>
  );
}

function SectionEditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" className="relative z-10 -mr-2 h-8" onClick={onClick}>
      <Pencil className="h-3.5 w-3.5" />
      {label}
    </Button>
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
