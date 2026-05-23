"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useHealthData, type DataMode } from "@/hooks/use-health-data";
import type {
  Appointment,
  EmergencyContact,
  FamilyMember,
  HealthDocument,
  HealthProfile,
  ShareLink,
  TimelineEvent,
} from "@/types/health";

interface HealthDataContextValue {
  mode: DataMode;
  loading: boolean;
  profile: HealthProfile;
  timeline: TimelineEvent[];
  documents: HealthDocument[];
  familyMembers: FamilyMember[];
  appointments: Appointment[];
  userId: string | null;
  reload: () => Promise<void>;
  isDemo: boolean;
  isLive: boolean;
  addTimelineEvent: (event: {
    type: TimelineEvent["type"];
    title: string;
    description?: string;
    date: string;
    provider?: string;
    category?: string;
  }) => Promise<{ error: string | null }>;
  removeTimelineEvent: (eventId: string) => Promise<{ error: string | null }>;
  editTimelineEvent: (
    eventId: string,
    updates: {
      type?: TimelineEvent["type"];
      title?: string;
      description?: string;
      date?: string;
      provider?: string;
      category?: string;
    }
  ) => Promise<{ error: string | null }>;
  saveProfile: (
    updates: Partial<
      Pick<HealthProfile, "fullName" | "dateOfBirth" | "bloodType" | "allergies" | "chronicIllnesses">
    >
  ) => Promise<{ error: string | null }>;
  addAllergy: (allergy: string) => Promise<{ error: string | null }>;
  removeAllergy: (allergy: string) => Promise<{ error: string | null }>;
  addEmergencyContact: (contact: Omit<EmergencyContact, "id">) => Promise<{ error: string | null }>;
  removeEmergencyContact: (contactId: string) => Promise<{ error: string | null }>;
  uploadDocument: (file: File, category: string) => Promise<{ error: string | null }>;
  removeDocument: (documentId: string) => Promise<{ error: string | null }>;
  addMedication: (med: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    prescriber?: string;
  }) => Promise<{ error: string | null }>;
  removeMedication: (medicationId: string) => Promise<{ error: string | null }>;
  addAppointment: (input: Omit<Appointment, "id">) => Promise<{ error: string | null }>;
  removeAppointment: (appointmentId: string) => Promise<{ error: string | null }>;
  addFamilyMember: (input: {
    name: string;
    relationship: string;
    dateOfBirth: string;
  }) => Promise<{ error: string | null }>;
  downloadDocument: (doc: HealthDocument) => Promise<{ error: string | null }>;
  exportHealthData: () => void;
  revokeShareLink: (token: string) => Promise<{ error: string | null }>;
  fetchShareLinks: () => Promise<ShareLink[]>;
}

const HealthDataContext = createContext<HealthDataContextValue | null>(null);

export function HealthDataProvider({ children }: { children: ReactNode }) {
  const value = useHealthData();
  return <HealthDataContext.Provider value={value}>{children}</HealthDataContext.Provider>;
}

export function useHealthDataContext() {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error("useHealthDataContext must be used within HealthDataProvider");
  }
  return context;
}
