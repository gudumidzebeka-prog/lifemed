import {
  demoAppointments,
  demoDocuments,
  demoFamilyMembers,
  demoProfile,
  demoTimeline,
} from "@/data/demo-data";
import type {
  Appointment,
  FamilyMember,
  HealthDocument,
  HealthProfile,
  TimelineEvent,
} from "@/types/health";

export const DEMO_PROFILE_NAME = demoProfile.fullName;

export const DEMO_TIMELINE_TITLES = demoTimeline.map((event) => event.title);

export const DEMO_MEDICATIONS = demoProfile.currentMedications.map((med) => med.name);

export const DEMO_CONTACTS = demoProfile.emergencyContacts.map((contact) => contact.name);

export const DEMO_FAMILY_NAMES = demoFamilyMembers.map((member) => member.name);

export const DEMO_DOCUMENT_NAMES = demoDocuments.map((doc) => doc.name);

export const DEMO_APPOINTMENT_TITLES = demoAppointments.map((apt) => apt.title);

const demoTitleSet = new Set(DEMO_TIMELINE_TITLES);
const demoMedSet = new Set(DEMO_MEDICATIONS);
const demoContactSet = new Set(DEMO_CONTACTS);
const demoFamilySet = new Set(DEMO_FAMILY_NAMES);
const demoDocumentSet = new Set(DEMO_DOCUMENT_NAMES);
const demoAppointmentSet = new Set(DEMO_APPOINTMENT_TITLES);

export function isDemoSeedProfile(profile: Pick<HealthProfile, "fullName">) {
  return profile.fullName.trim() === DEMO_PROFILE_NAME;
}

export function accountHasDemoSeedData(input: {
  profile?: HealthProfile | null;
  timeline?: TimelineEvent[];
  documents?: HealthDocument[];
  familyMembers?: FamilyMember[];
  appointments?: Appointment[];
}) {
  const profile = input.profile;
  const timeline = input.timeline ?? [];
  const documents = input.documents ?? [];
  const familyMembers = input.familyMembers ?? [];
  const appointments = input.appointments ?? [];

  if (profile && isDemoSeedProfile(profile)) return true;

  if (timeline.some((event) => demoTitleSet.has(event.title))) return true;
  if (profile?.currentMedications?.some((med) => demoMedSet.has(med.name))) return true;
  if (profile?.emergencyContacts?.some((contact) => demoContactSet.has(contact.name))) return true;
  if (profile?.allergies?.some((allergy) => demoProfile.allergies.includes(allergy))) return true;
  if (profile?.chronicIllnesses?.some((illness) => demoProfile.chronicIllnesses.includes(illness))) return true;
  if (documents.some((doc) => demoDocumentSet.has(doc.name))) return true;
  if (familyMembers.some((member) => demoFamilySet.has(member.name))) return true;
  if (appointments.some((apt) => demoAppointmentSet.has(apt.title))) return true;

  return false;
}

export async function clearDemoSeedFromAccount() {
  const res = await fetch("/api/onboarding/clear-demo", {
    method: "POST",
    credentials: "same-origin",
  });

  if (!res.ok) return false;

  const data = (await res.json()) as { cleared?: boolean };
  return Boolean(data.cleared);
}

export function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
}

export function profileHasDemoMetadata(profile: HealthProfile) {
  return (
    profile.dateOfBirth === demoProfile.dateOfBirth ||
    profile.bloodType === demoProfile.bloodType ||
    arraysEqual(profile.allergies ?? [], demoProfile.allergies) ||
    arraysEqual(profile.chronicIllnesses ?? [], demoProfile.chronicIllnesses)
  );
}
