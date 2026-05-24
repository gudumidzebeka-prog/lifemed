import { demoProfile, demoTimeline } from "@/data/demo-data";
import { EMPTY_PROFILE, emptyLiveProfile } from "@/lib/health/empty-profile";
import {
  fetchHealthProfile,
  fetchTimelineEvents,
} from "@/lib/health/db";
import { getTranslation, type Locale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { HealthProfile, TimelineEvent } from "@/types/health";

export interface AIHealthContext {
  profile: HealthProfile;
  timeline: TimelineEvent[];
  source: "demo" | "live";
}

export async function buildAIHealthContext(): Promise<AIHealthContext> {
  if (!isSupabaseConfigured()) {
    return {
      profile: demoProfile,
      timeline: demoTimeline,
      source: "demo",
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        profile: EMPTY_PROFILE,
        timeline: [],
        source: "live",
      };
    }

    const [profile, timeline] = await Promise.all([
      fetchHealthProfile(supabase, user.id),
      fetchTimelineEvents(supabase, user.id),
    ]);

    return {
      profile: profile ?? emptyLiveProfile(user),
      timeline,
      source: "live",
    };
  } catch {
    return {
      profile: EMPTY_PROFILE,
      timeline: [],
      source: "live",
    };
  }
}

export function formatContextForPrompt(ctx: AIHealthContext) {
  const { profile, timeline } = ctx;
  const recentTimeline = (timeline ?? []).slice(-10);
  const medications = profile.currentMedications ?? [];
  const allergies = profile.allergies ?? [];
  const chronicIllnesses = profile.chronicIllnesses ?? [];
  const emergencyContacts = profile.emergencyContacts ?? [];

  return {
    patient: {
      name: profile.fullName ?? "",
      dateOfBirth: profile.dateOfBirth ?? "",
      bloodType: profile.bloodType ?? "",
      allergies,
      chronicIllnesses,
      medications: medications.map((m) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
      })),
      emergencyContacts: emergencyContacts.length,
    },
    recentTimeline: recentTimeline.map((e) => ({
      date: e.date,
      type: e.type,
      title: e.title,
      description: e.description,
    })),
    totalEvents: timeline.length,
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
  return /doctor|provider|врач|ექიმ/i.test(message);
}

function hasPatientData(profile: HealthProfile, timeline: TimelineEvent[]) {
  return Boolean(
    profile.fullName.trim() ||
      profile.currentMedications.length ||
      profile.allergies.length ||
      timeline.length
  );
}

export function buildSmartDemoResponse(
  message: string,
  ctx: AIHealthContext,
  locale: Locale = "ka"
): string {
  const { profile, timeline, source } = ctx;

  if (source === "live" && !hasPatientData(profile, timeline)) {
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
    if (labEvents.length === 0) {
      return getTranslation(locale, "ai.demoNoLabs");
    }
    const latest = labEvents[labEvents.length - 1];
    const notes = latest.description ? ` ${latest.description}` : "";
    return getTranslation(locale, "ai.demoLabLatest", {
      title: latest.title,
      date: latest.date,
      notes,
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
