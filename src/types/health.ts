export type TimelineEventType =
  | "vaccination"
  | "illness"
  | "surgery"
  | "hospitalization"
  | "diagnosis"
  | "treatment"
  | "lab_test"
  | "doctor_visit"
  | "imaging"
  | "medication";

export interface TimelineEvent {
  id: string;
  userId: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  date: string;
  provider?: string;
  category?: string;
  attachments?: string[];
}

export interface HealthProfile {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: string;
  bloodType?: string;
  allergies: string[];
  emergencyContacts: EmergencyContact[];
  chronicIllnesses: string[];
  currentMedications: Medication[];
  avatarUrl?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescriber?: string;
}

export interface HealthDocument {
  id: string;
  userId: string;
  name: string;
  category: string;
  folderId?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  tags?: string[];
}

export interface DocumentFolder {
  id: string;
  userId: string;
  name: string;
  parentId?: string;
  color?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  dateOfBirth: string;
  avatarUrl?: string;
  managedBy: string;
}

export interface ShareLink {
  id: string;
  token: string;
  expiresAt: string;
  permissions: SharePermission[];
  recordIds: string[];
  createdAt: string;
}

export interface SharePermission {
  type: "view" | "download";
  scope: "timeline" | "documents" | "profile" | "emergency";
}

export interface Appointment {
  id: string;
  title: string;
  provider: string;
  date: string;
  location?: string;
}

export interface AIInsight {
  id: string;
  type: "summary" | "lab" | "interaction" | "organization";
  title: string;
  content: string;
  createdAt: string;
  disclaimer: boolean;
}

export interface HealthStat {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "stable";
  unit?: string;
}

export interface CategoryRecord {
  id: string;
  categoryId: string;
  title: string;
  date: string;
  summary: string;
  details?: string;
  /** Present when this row represents an uploaded document */
  documentId?: string;
}
