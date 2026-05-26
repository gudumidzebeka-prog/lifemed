import { demoProfile, demoTimeline, demoDocuments, demoAppointments } from "@/data/demo-data";
import { EMPTY_PROFILE, emptyLiveProfile } from "@/lib/health/empty-profile";
import type { AIClientSnapshot } from "@/lib/health/ai-client-snapshot";
import {
  fetchAppointments,
  fetchHealthDocuments,
  fetchHealthProfile,
  fetchTimelineEvents,
} from "@/lib/health/db";
import { getTranslation, type Locale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Appointment, HealthDocument, HealthProfile, TimelineEvent } from "@/types/health";

export interface AIHealthContext {
  profile: HealthProfile;
  timeline: TimelineEvent[];
  documents: HealthDocument[];
  appointments: Appointment[];
  source: "demo" | "live";
}

function countPatientData(ctx: AIHealthContext) {
  return (
    (ctx.profile.fullName?.trim() ? 1 : 0) +
    ctx.profile.currentMedications.length +
    ctx.profile.allergies.length +
    ctx.profile.chronicIllnesses.length +
    ctx.profile.emergencyContacts.length +
    ctx.timeline.length +
    ctx.documents.length +
    ctx.appointments.length
  );
}

function mergePreferRicher<T>(server: T[], client: T[] | undefined) {
  if (!client?.length) return server;
  if (!server.length) return client;
  return client.length >= server.length ? client : server;
}

function mergeProfiles(server: HealthProfile, client?: HealthProfile): HealthProfile {
  if (!client) return server;

  return {
    ...server,
    ...client,
    fullName: client.fullName?.trim() ? client.fullName : server.fullName,
    currentMedications: mergePreferRicher(server.currentMedications, client.currentMedications),
    allergies: mergePreferRicher(server.allergies, client.allergies),
    chronicIllnesses: mergePreferRicher(server.chronicIllnesses, client.chronicIllnesses),
    emergencyContacts: mergePreferRicher(server.emergencyContacts, client.emergencyContacts),
  };
}

export function mergeAIHealthContext(server: AIHealthContext, client?: AIClientSnapshot): AIHealthContext {
  if (!client) return server;

  return {
    profile: mergeProfiles(server.profile, client.profile),
    timeline: mergePreferRicher(server.timeline, client.timeline),
    documents: mergePreferRicher(server.documents, client.documents),
    appointments: mergePreferRicher(server.appointments, client.appointments),
    source: server.source,
  };
}

export async function buildAIHealthContext(client?: AIClientSnapshot): Promise<AIHealthContext> {
  if (!isSupabaseConfigured()) {
    const base: AIHealthContext = {
      profile: demoProfile,
      timeline: demoTimeline,
      documents: demoDocuments,
      appointments: demoAppointments,
      source: "demo",
    };
    return mergeAIHealthContext(base, client);
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const empty: AIHealthContext = {
        profile: EMPTY_PROFILE,
        timeline: [],
        documents: [],
        appointments: [],
        source: "live",
      };
      return mergeAIHealthContext(empty, client);
    }

    const [profile, timeline, documents, aptResult] = await Promise.all([
      fetchHealthProfile(supabase, user.id),
      fetchTimelineEvents(supabase, user.id),
      fetchHealthDocuments(supabase, user.id),
      fetchAppointments(supabase, user.id),
    ]);

    const base: AIHealthContext = {
      profile: profile ?? emptyLiveProfile(user),
      timeline,
      documents,
      appointments: aptResult.error ? [] : aptResult.appointments,
      source: "live",
    };

    return mergeAIHealthContext(base, client);
  } catch {
    const empty: AIHealthContext = {
      profile: EMPTY_PROFILE,
      timeline: [],
      documents: [],
      appointments: [],
      source: "live",
    };
    return mergeAIHealthContext(empty, client);
  }
}

export function formatContextForPrompt(ctx: AIHealthContext) {
  const { profile, timeline, documents, appointments } = ctx;
  const medications = profile.currentMedications ?? [];
  const allergies = profile.allergies ?? [];
  const chronicIllnesses = profile.chronicIllnesses ?? [];
  const emergencyContacts = profile.emergencyContacts ?? [];
  const now = Date.now();

  const upcomingAppointments = appointments
    .filter((apt) => new Date(apt.date).getTime() >= now)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  const recentAppointments = appointments
    .filter((apt) => new Date(apt.date).getTime() < now)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const recentTimeline = [...timeline]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 15);

  const recentDocuments = [...documents]
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    .slice(0, 15);

  return {
    patient: {
      name: profile.fullName ?? "",
      dateOfBirth: profile.dateOfBirth ?? "",
      bloodType: profile.bloodType ?? "",
      city: profile.city ?? "",
      gender: profile.gender ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      allergies,
      chronicIllnesses,
      medications: medications.map((m) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        startDate: m.startDate,
        prescriber: m.prescriber ?? "",
        reminderTimes: m.reminderTimes ?? [],
      })),
      emergencyContacts: emergencyContacts.map((c) => ({
        name: c.name,
        relationship: c.relationship,
        phone: c.phone,
        email: c.email ?? "",
      })),
    },
    recentTimeline: recentTimeline.map((e) => ({
      date: e.date,
      type: e.type,
      title: e.title,
      description: e.description ?? "",
      provider: e.provider ?? "",
      category: e.category ?? "",
    })),
    documents: recentDocuments.map((doc) => ({
      name: doc.name,
      category: doc.category,
      uploadedAt: doc.uploadedAt,
      fileType: doc.fileType,
      tags: doc.tags ?? [],
    })),
    upcomingAppointments: upcomingAppointments.map((apt) => ({
      title: apt.title,
      provider: apt.provider,
      date: apt.date,
      location: apt.location ?? "",
    })),
    recentAppointments: recentAppointments.map((apt) => ({
      title: apt.title,
      provider: apt.provider,
      date: apt.date,
      location: apt.location ?? "",
    })),
    stats: {
      totalTimelineEvents: timeline.length,
      totalDocuments: documents.length,
      totalAppointments: appointments.length,
      totalMedications: medications.length,
    },
  };
}

function matchesSummary(message: string) {
  return /summar|history|истори|сумм|შეჯამ|ისტორი/i.test(message);
}

function matchesLabs(message: string) {
  return /lab|result|blood|анализ|кров|ანალიზ/i.test(message);
}

function matchesMeds(message: string) {
  return /interaction|medication|лекарств|медикамент|მედიკამენტ/i.test(message);
}

function matchesDoctor(message: string) {
  return /doctor|provider|visit|appointment|врач|визит|ექიმ|ვიზიტ/i.test(message);
}

function matchesAppointments(message: string) {
  return /appointment|visit|ვიზიტ|прием|запись/i.test(message);
}

export function buildSmartDemoResponse(
  message: string,
  ctx: AIHealthContext,
  locale: Locale = "ka"
): string {
  const { profile, timeline, source, appointments, documents } = ctx;

  if (source === "live" && countPatientData(ctx) === 0) {
    return getTranslation(locale, "ai.noDataYet");
  }

  const medsList = profile.currentMedications
    .map((m) => `${m.name} ${m.dosage} (${m.frequency})`)
    .join(", ");
  const medsDisplay = medsList || getTranslation(locale, "emergency.noneReported");
  const allergiesDisplay =
    profile.allergies.join(", ") || getTranslation(locale, "emergency.noAllergies");
  const chronicDisplay =
    profile.chronicIllnesses.join(", ") || getTranslation(locale, "emergency.noneReported");
  const firstName = profile.fullName.trim().split(/\s+/)[0] || getTranslation(locale, "ai.you");

  if (matchesAppointments(message) && appointments.length > 0) {
    const next = [...appointments].sort((a, b) => a.date.localeCompare(b.date))[0];
    return `${getTranslation(locale, "dashboard.nextAppointment")}: ${next.title} — ${next.provider}, ${next.date}${next.location ? ` (${next.location})` : ""}.`;
  }

  if (matchesSummary(message)) {
    const recent =
      timeline
        .slice(-5)
        .map((e) => `${e.date}: ${e.title}`)
        .join("; ") || getTranslation(locale, "dashboard.summaryRoutine");
    return getTranslation(locale, "ai.demoSummary", {
      name: profile.fullName || firstName,
      events: timeline.length,
      recent,
      meds: medsDisplay,
      allergies: allergiesDisplay,
    });
  }

  if (matchesLabs(message)) {
    const labEvents = timeline.filter((e) => e.type === "lab_test");
    const labDocs = documents.filter((d) => /lab|result|blood|ანალიზ/i.test(d.category));
    if (labEvents.length === 0 && labDocs.length === 0) {
      return getTranslation(locale, "ai.demoNoLabs");
    }
    if (labEvents.length > 0) {
      const latest = labEvents[labEvents.length - 1];
      const notes = latest.description ? ` ${latest.description}` : "";
      return getTranslation(locale, "ai.demoLabLatest", {
        title: latest.title,
        date: latest.date,
        notes,
      });
    }
    const latestDoc = labDocs[labDocs.length - 1];
    return getTranslation(locale, "ai.demoLabLatest", {
      title: latestDoc.name,
      date: latestDoc.uploadedAt.slice(0, 10),
      notes: ` (${latestDoc.category})`,
    });
  }

  if (matchesMeds(message)) {
    if (profile.currentMedications.length === 0) {
      return getTranslation(locale, "ai.demoNoMeds");
    }
    return getTranslation(locale, "ai.demoMedCheck", {
      meds: medsList,
      allergies: allergiesDisplay,
    });
  }

  if (matchesDoctor(message)) {
    return getTranslation(locale, "ai.demoDoctorSummary", {
      name: profile.fullName || firstName,
      dob: profile.dateOfBirth || "—",
      bloodType: profile.bloodType || "—",
      allergies: allergiesDisplay,
      chronic: chronicDisplay,
      meds: medsDisplay,
      events: timeline.length,
    });
  }

  return getTranslation(locale, "ai.demoDefault", {
    name: firstName,
    events: timeline.length,
    medsCount: profile.currentMedications.length,
  });
}
