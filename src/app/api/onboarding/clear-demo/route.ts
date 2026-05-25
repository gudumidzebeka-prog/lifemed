import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  DEMO_APPOINTMENT_TITLES,
  DEMO_CONTACTS,
  DEMO_DOCUMENT_NAMES,
  DEMO_FAMILY_NAMES,
  DEMO_MEDICATIONS,
  DEMO_PROFILE_NAME,
  DEMO_TIMELINE_TITLES,
  profileHasDemoMetadata,
} from "@/lib/health/demo-seed";

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  const [
    { data: profile },
    { data: timeline },
    { data: medications },
    { data: contacts },
    { data: documents },
    { data: family },
    { data: appointments },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("timeline_events").select("id, title").eq("user_id", userId),
    supabase.from("medications").select("id, name").eq("user_id", userId),
    supabase.from("emergency_contacts").select("id, name").eq("user_id", userId),
    supabase.from("health_documents").select("id, name").eq("user_id", userId),
    supabase.from("family_members").select("id, name").eq("manager_id", userId),
    supabase.from("appointments").select("id, title").eq("user_id", userId),
  ]);

  const demoTimelineIds =
    timeline?.filter((row) => DEMO_TIMELINE_TITLES.includes(row.title)).map((row) => row.id) ?? [];
  const demoMedicationIds =
    medications?.filter((row) => DEMO_MEDICATIONS.includes(row.name)).map((row) => row.id) ?? [];
  const demoContactIds =
    contacts?.filter((row) => DEMO_CONTACTS.includes(row.name)).map((row) => row.id) ?? [];
  const demoDocumentIds =
    documents?.filter((row) => DEMO_DOCUMENT_NAMES.includes(row.name)).map((row) => row.id) ?? [];
  const demoFamilyIds =
    family?.filter((row) => DEMO_FAMILY_NAMES.includes(row.name)).map((row) => row.id) ?? [];
  const demoAppointmentIds =
    appointments?.filter((row) => DEMO_APPOINTMENT_TITLES.includes(row.title)).map((row) => row.id) ??
    [];

  const hasDemoRows =
    demoTimelineIds.length > 0 ||
    demoMedicationIds.length > 0 ||
    demoContactIds.length > 0 ||
    demoDocumentIds.length > 0 ||
    demoFamilyIds.length > 0 ||
    demoAppointmentIds.length > 0 ||
    profile?.full_name === DEMO_PROFILE_NAME ||
    (profile && profileHasDemoMetadata({
      id: profile.id,
      userId: profile.id,
      fullName: profile.full_name,
      dateOfBirth: profile.date_of_birth ?? "",
      bloodType: profile.blood_type ?? undefined,
      allergies: profile.allergies ?? [],
      chronicIllnesses: profile.chronic_illnesses ?? [],
      emergencyContacts: [],
      currentMedications: [],
    }));

  if (!hasDemoRows) {
    return NextResponse.json({ cleared: false, reason: "no_demo_data" });
  }

  await Promise.all([
    demoTimelineIds.length
      ? supabase.from("timeline_events").delete().in("id", demoTimelineIds)
      : Promise.resolve(),
    demoMedicationIds.length
      ? supabase.from("medications").delete().in("id", demoMedicationIds)
      : Promise.resolve(),
    demoContactIds.length
      ? supabase.from("emergency_contacts").delete().in("id", demoContactIds)
      : Promise.resolve(),
    demoDocumentIds.length
      ? supabase.from("health_documents").delete().in("id", demoDocumentIds)
      : Promise.resolve(),
    demoFamilyIds.length
      ? supabase.from("family_members").delete().in("id", demoFamilyIds)
      : Promise.resolve(),
    demoAppointmentIds.length
      ? supabase.from("appointments").delete().in("id", demoAppointmentIds)
      : Promise.resolve(),
  ]);

  const metaName = user.user_metadata?.full_name;
  const fallbackName =
    typeof metaName === "string" && metaName.trim()
      ? metaName.trim()
      : user.email?.split("@")[0] ?? "User";

  const profileUpdate: Record<string, unknown> = {};

  if (profile?.full_name === DEMO_PROFILE_NAME) {
    profileUpdate.full_name = fallbackName;
  }

  if (profile && profileHasDemoMetadata({
    id: profile.id,
    userId: profile.id,
    fullName: profile.full_name,
    dateOfBirth: profile.date_of_birth ?? "",
    bloodType: profile.blood_type ?? undefined,
    allergies: profile.allergies ?? [],
    chronicIllnesses: profile.chronic_illnesses ?? [],
    emergencyContacts: [],
    currentMedications: [],
  })) {
    if (profile.date_of_birth === "1992-03-15") profileUpdate.date_of_birth = null;
    if (profile.blood_type === "O+") profileUpdate.blood_type = null;
    if (
      JSON.stringify([...(profile.allergies ?? [])].sort()) ===
      JSON.stringify(["Penicillin", "Shellfish"].sort())
    ) {
      profileUpdate.allergies = [];
    }
    if (
      JSON.stringify(profile.chronic_illnesses ?? []) ===
      JSON.stringify(["Systemic Lupus Erythematosus"])
    ) {
      profileUpdate.chronic_illnesses = [];
    }
  }

  if (Object.keys(profileUpdate).length > 0) {
    await supabase.from("profiles").update(profileUpdate).eq("id", userId);
  }

  return NextResponse.json({
    cleared: true,
    removed: {
      timeline: demoTimelineIds.length,
      medications: demoMedicationIds.length,
      contacts: demoContactIds.length,
      documents: demoDocumentIds.length,
      family: demoFamilyIds.length,
      appointments: demoAppointmentIds.length,
    },
  });
}
