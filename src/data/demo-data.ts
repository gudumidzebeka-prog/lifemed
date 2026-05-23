import type {
  AIInsight,
  Appointment,
  CategoryRecord,
  FamilyMember,
  HealthDocument,
  HealthProfile,
  HealthStat,
  Medication,
  TimelineEvent,
} from "@/types/health";

export const demoProfile: HealthProfile = {
  id: "profile-1",
  userId: "user-1",
  fullName: "Sarah Chen",
  dateOfBirth: "1992-03-15",
  bloodType: "O+",
  allergies: ["Penicillin", "Shellfish"],
  emergencyContacts: [
    {
      id: "ec-1",
      name: "Michael Chen",
      relationship: "Spouse",
      phone: "+1 (555) 234-5678",
      email: "michael.chen@email.com",
    },
    {
      id: "ec-2",
      name: "Dr. Emily Watson",
      relationship: "Primary Care",
      phone: "+1 (555) 987-6543",
    },
  ],
  chronicIllnesses: ["Systemic Lupus Erythematosus"],
  currentMedications: [
    {
      id: "med-1",
      name: "Hydroxychloroquine",
      dosage: "200mg",
      frequency: "Once daily",
      startDate: "2025-01-10",
      prescriber: "Dr. Patel",
    },
    {
      id: "med-2",
      name: "Vitamin D3",
      dosage: "2000 IU",
      frequency: "Once daily",
      startDate: "2024-06-01",
    },
  ],
};

export const demoTimeline: TimelineEvent[] = [
  {
    id: "tl-1",
    userId: "user-1",
    type: "illness",
    title: "Chickenpox",
    description: "Mild case, recovered at home",
    date: "2010-08-12",
  },
  {
    id: "tl-2",
    userId: "user-1",
    type: "surgery",
    title: "Appendectomy",
    description: "Laparoscopic procedure at City General Hospital",
    date: "2014-03-22",
    provider: "Dr. Morrison",
  },
  {
    id: "tl-3",
    userId: "user-1",
    type: "vaccination",
    title: "COVID-19 Vaccine (Pfizer)",
    description: "Booster dose",
    date: "2020-12-05",
  },
  {
    id: "tl-4",
    userId: "user-1",
    type: "illness",
    title: "COVID-19",
    description: "Mild symptoms, home recovery",
    date: "2021-01-18",
  },
  {
    id: "tl-5",
    userId: "user-1",
    type: "lab_test",
    title: "Complete Blood Count",
    description: "Routine annual checkup",
    date: "2023-09-14",
    provider: "Quest Diagnostics",
  },
  {
    id: "tl-6",
    userId: "user-1",
    type: "diagnosis",
    title: "Lupus Diagnosis",
    description: "Systemic Lupus Erythematosus confirmed by rheumatologist",
    date: "2024-11-03",
    provider: "Dr. Patel, Rheumatology",
  },
  {
    id: "tl-7",
    userId: "user-1",
    type: "treatment",
    title: "Immunosuppressive Treatment Started",
    description: "Hydroxychloroquine prescribed",
    date: "2025-01-10",
    provider: "Dr. Patel",
  },
  {
    id: "tl-8",
    userId: "user-1",
    type: "imaging",
    title: "Chest X-Ray",
    description: "Clear, no abnormalities",
    date: "2025-02-28",
    provider: "Radiology Associates",
  },
];

export const demoDocuments: HealthDocument[] = [
  {
    id: "doc-1",
    userId: "user-1",
    name: "CBC Results - Sept 2023.pdf",
    category: "Lab Results",
    fileUrl: "#",
    fileType: "application/pdf",
    fileSize: 245000,
    uploadedAt: "2023-09-15T10:30:00Z",
    tags: ["blood work", "annual"],
  },
  {
    id: "doc-2",
    userId: "user-1",
    name: "Lupus Diagnosis Letter.pdf",
    category: "Doctor Notes",
    fileUrl: "#",
    fileType: "application/pdf",
    fileSize: 128000,
    uploadedAt: "2024-11-05T14:20:00Z",
    tags: ["rheumatology", "diagnosis"],
  },
  {
    id: "doc-3",
    userId: "user-1",
    name: "Chest X-Ray Report.pdf",
    category: "Imaging",
    fileUrl: "#",
    fileType: "application/pdf",
    fileSize: 890000,
    uploadedAt: "2025-03-01T09:15:00Z",
    tags: ["x-ray", "chest"],
  },
  {
    id: "doc-4",
    userId: "user-1",
    name: "Hydroxychloroquine Prescription.jpg",
    category: "Prescriptions",
    fileUrl: "#",
    fileType: "image/jpeg",
    fileSize: 156000,
    uploadedAt: "2025-01-10T16:45:00Z",
    tags: ["medication", "prescription"],
  },
];

export const demoAppointments: Appointment[] = [
  {
    id: "apt-1",
    title: "Rheumatology Follow-up",
    provider: "Dr. Patel",
    date: "2026-06-15T10:00:00Z",
    location: "Pacific Medical Center",
  },
  {
    id: "apt-2",
    title: "Annual Physical",
    provider: "Dr. Watson",
    date: "2026-07-22T14:30:00Z",
    location: "City Health Clinic",
  },
];

export const demoHealthStats: HealthStat[] = [
  { label: "Timeline Events", value: 24, trend: "stable" },
  { label: "Documents", value: 18, trend: "up" },
  { label: "Active Medications", value: 2, trend: "stable" },
  { label: "Years Tracked", value: 16, trend: "up" },
];

export const demoAIInsights: AIInsight[] = [
  {
    id: "ai-1",
    type: "summary",
    title: "Health Summary",
    content:
      "Your medical history spans 16 years with notable events including appendectomy in 2014 and a lupus diagnosis in 2024. You're currently on immunosuppressive therapy with regular rheumatology follow-ups.",
    createdAt: "2026-05-20T08:00:00Z",
    disclaimer: true,
  },
  {
    id: "ai-2",
    type: "lab",
    title: "Lab Insight",
    content:
      "Your iron appears slightly low, which may contribute to fatigue. Consider discussing this with your doctor at your next visit.",
    createdAt: "2026-05-18T12:00:00Z",
    disclaimer: true,
  },
];

export const demoFamilyMembers: FamilyMember[] = [
  {
    id: "fam-1",
    name: "Emma Chen",
    relationship: "Daughter",
    dateOfBirth: "2018-07-22",
    managedBy: "user-1",
  },
  {
    id: "fam-2",
    name: "Robert Chen",
    relationship: "Father",
    dateOfBirth: "1958-11-30",
    managedBy: "user-1",
  },
];

export type DemoFamilyNoteKey =
  | "wellnessVisit"
  | "fluVaccination"
  | "bpScreening"
  | "medReview";

export type DemoFamilyNoteTypeKey =
  | "typeCheckup"
  | "typeVaccination"
  | "typeScreening"
  | "typePrimaryCare";

export interface DemoFamilyHealthNote {
  titleKey: DemoFamilyNoteKey;
  typeKey: DemoFamilyNoteTypeKey;
  date: string;
}

export const demoFamilyHealthNotes: Record<string, DemoFamilyHealthNote[]> = {
  "fam-1": [
    { titleKey: "wellnessVisit", typeKey: "typeCheckup", date: "2025-11-10" },
    { titleKey: "fluVaccination", typeKey: "typeVaccination", date: "2025-10-05" },
  ],
  "fam-2": [
    { titleKey: "bpScreening", typeKey: "typeScreening", date: "2025-09-20" },
    { titleKey: "medReview", typeKey: "typePrimaryCare", date: "2025-06-15" },
  ],
};

export const demoCategoryRecords: Record<string, CategoryRecord[]> = {
  immunology: [
    {
      id: "cr-1",
      categoryId: "immunology",
      title: "Lupus Diagnosis",
      date: "2024-11-03",
      summary: "SLE confirmed with positive ANA and anti-dsDNA",
      details: "Rheumatologist Dr. Patel confirmed diagnosis after comprehensive panel.",
    },
    {
      id: "cr-2",
      categoryId: "immunology",
      title: "Immunosuppressive Therapy",
      date: "2025-01-10",
      summary: "Started Hydroxychloroquine 200mg daily",
    },
  ],
  cardiology: [
    {
      id: "cr-3",
      categoryId: "cardiology",
      title: "Annual ECG",
      date: "2023-09-14",
      summary: "Normal sinus rhythm, no abnormalities detected",
    },
  ],
  "lab-results": [
    {
      id: "cr-4",
      categoryId: "lab-results",
      title: "Complete Blood Count",
      date: "2023-09-14",
      summary: "Hemoglobin slightly below reference range",
      details: "Hgb: 11.8 g/dL (ref: 12.0-15.5). All other values within normal limits.",
    },
  ],
};

export const upcomingMedications: Medication[] = demoProfile.currentMedications;

export function getTimelineTypeLabel(type: TimelineEvent["type"]) {
  const labels: Record<TimelineEvent["type"], string> = {
    vaccination: "Vaccination",
    illness: "Illness",
    surgery: "Surgery",
    hospitalization: "Hospitalization",
    diagnosis: "Diagnosis",
    treatment: "Treatment",
    lab_test: "Lab Test",
    doctor_visit: "Doctor Visit",
    imaging: "Imaging",
    medication: "Medication",
  };
  return labels[type];
}

export function getTimelineTypeColor(type: TimelineEvent["type"]) {
  const colors: Record<TimelineEvent["type"], string> = {
    vaccination: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    illness: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    surgery: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    hospitalization: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    diagnosis: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    treatment: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    lab_test: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    doctor_visit: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    imaging: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    medication: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  };
  return colors[type];
}
