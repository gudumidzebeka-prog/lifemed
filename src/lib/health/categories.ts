import { HEALTH_CATEGORIES } from "@/lib/constants";

import type { CategoryRecord, HealthDocument, HealthProfile, TimelineEvent } from "@/types/health";

import type { Locale } from "@/lib/i18n";

import { getTranslation } from "@/lib/i18n";



const TIMELINE_TYPE_TO_CATEGORY: Partial<Record<TimelineEvent["type"], string>> = {

  vaccination: "vaccinations",

  surgery: "surgeries",

  diagnosis: "immunology",

  treatment: "medications",

  lab_test: "lab-results",

  imaging: "lab-results",

  medication: "medications",

  doctor_visit: "cardiology",

  illness: "immunology",

  hospitalization: "cardiology",

};



const DOC_CATEGORY_TO_HEALTH: Record<string, string> = {

  "Lab Results": "lab-results",

  Prescriptions: "medications",

  Imaging: "lab-results",

  "Doctor Notes": "immunology",

  "Vaccination Records": "vaccinations",

};



function timelineToRecord(event: TimelineEvent, locale: Locale): CategoryRecord {

  const categoryId =

    event.category && HEALTH_CATEGORIES.some((c) => c.id === event.category)

      ? event.category

      : TIMELINE_TYPE_TO_CATEGORY[event.type] ?? "cardiology";



  return {

    id: `tl-${event.id}`,

    categoryId,

    title: event.title,

    date: event.date,

    summary: event.description ?? getTimelineSummary(event),

    details: event.provider

      ? `${getTranslation(locale, "common.provider")}: ${event.provider}`

      : undefined,

  };

}



function documentToRecord(doc: HealthDocument, locale: Locale): CategoryRecord {

  const categoryId = DOC_CATEGORY_TO_HEALTH[doc.category] ?? "lab-results";

  return {

    id: `doc-${doc.id}`,

    categoryId,

    title: doc.name,

    date: doc.uploadedAt.slice(0, 10),

    summary: `${doc.category} · ${formatBytes(doc.fileSize)}`,

    details: doc.tags?.length

      ? `${getTranslation(locale, "categories.tagsLabel")} ${doc.tags.join(", ")}`

      : undefined,

    documentId: doc.id,

  };

}



function allergyRecords(profile: HealthProfile, locale: Locale): CategoryRecord[] {

  return profile.allergies.map((allergy, i) => ({

    id: `allergy-${i}-${allergy}`,

    categoryId: "allergies",

    title: allergy,

    date: new Date().toISOString().slice(0, 10),

    summary: getTranslation(locale, "categories.allergySummary"),

  }));

}



function formatFrequency(frequency: string, locale: Locale) {
  const normalized = frequency.trim().toLowerCase();
  if (normalized === "once daily" || normalized === "daily") {
    return getTranslation(locale, "modals.medFrequencyDefault");
  }
  return frequency;
}

function medicationRecords(profile: HealthProfile, locale: Locale): CategoryRecord[] {
  return profile.currentMedications.map((med) => ({
    id: `med-${med.id}`,
    categoryId: "medications",
    title: med.name,
    date: med.startDate,
    summary: `${med.dosage} · ${formatFrequency(med.frequency, locale)}`,

    details: med.prescriber

      ? `${getTranslation(locale, "profile.prescribedBy")} ${med.prescriber}`

      : undefined,

  }));

}



function getTimelineSummary(event: TimelineEvent) {

  const parts = [event.type.replace("_", " ")];

  if (event.provider) parts.push(`· ${event.provider}`);

  return parts.join(" ");

}



function formatBytes(bytes: number) {

  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

}



export function buildCategoryRecords(

  timeline: TimelineEvent[],

  documents: HealthDocument[],

  profile: HealthProfile,

  locale: Locale = "ka"

): Record<string, CategoryRecord[]> {

  const records: CategoryRecord[] = [

    ...timeline.map((event) => timelineToRecord(event, locale)),

    ...documents.map((doc) => documentToRecord(doc, locale)),

    ...allergyRecords(profile, locale),

    ...medicationRecords(profile, locale),

  ];



  const grouped: Record<string, CategoryRecord[]> = {};

  for (const cat of HEALTH_CATEGORIES) {

    grouped[cat.id] = [];

  }



  for (const record of records) {

    if (!grouped[record.categoryId]) grouped[record.categoryId] = [];

    grouped[record.categoryId].push(record);

  }



  for (const key of Object.keys(grouped)) {

    grouped[key].sort((a, b) => b.date.localeCompare(a.date));

  }



  return grouped;

}



export function buildHealthSummary(

  profile: HealthProfile,

  timeline: TimelineEvent[],

  documents: HealthDocument[],

  locale: Locale = "ka"

): string {

  if (timeline.length === 0 && documents.length === 0) {

    return getTranslation(locale, "dashboard.summaryEmpty");

  }



  const years = timeline.length

    ? new Date().getFullYear() - new Date(timeline[0].date).getFullYear()

    : 0;

  const recent = timeline.slice(-3).map((e) => e.title).join(", ");

  const conditions =

    profile.chronicIllnesses.length > 0

      ? profile.chronicIllnesses.join(", ")

      : getTranslation(locale, "dashboard.summaryNoConditions");



  return getTranslation(locale, "dashboard.summaryYears", {

    years,

    events: timeline.length,

    docs: documents.length,

    recent: recent || getTranslation(locale, "dashboard.summaryRoutine"),

    conditions,

    meds: profile.currentMedications.length,

  });

}


