import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Appointment,
  EmergencyContact,
  HealthDocument,
  HealthProfile,
  Medication,
  ShareLink,
  TimelineEvent,
} from "@/types/health";
import { inferMimeType } from "@/lib/health/mime";

interface ProfileRow {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  blood_type: string | null;
  allergies: string[] | null;
  chronic_illnesses: string[] | null;
}

interface MedicationRow {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  prescriber: string | null;
  reminder_times?: string[] | null;
}

interface ContactRow {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string | null;
}

interface TimelineRow {
  id: string;
  user_id: string;
  type: TimelineEvent["type"];
  title: string;
  description: string | null;
  event_date: string;
  provider: string | null;
  category: string | null;
}

interface DocumentRow {
  id: string;
  user_id: string;
  name: string;
  category: string;
  file_path: string;
  file_type: string;
  file_size: number;
  tags: string[] | null;
  created_at: string;
}

export async function fetchHealthProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<HealthProfile | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return null;

  const row = profile as ProfileRow;

  const [{ data: medications }, { data: contacts }] = await Promise.all([
    supabase.from("medications").select("*").eq("user_id", userId).eq("active", true),
    supabase.from("emergency_contacts").select("*").eq("user_id", userId),
  ]);

  return {
    id: row.id,
    userId: row.id,
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth ?? "",
    bloodType: row.blood_type ?? undefined,
    allergies: row.allergies ?? [],
    chronicIllnesses: row.chronic_illnesses ?? [],
    emergencyContacts: ((contacts ?? []) as ContactRow[]).map((c) => ({
      id: c.id,
      name: c.name,
      relationship: c.relationship,
      phone: c.phone,
      email: c.email ?? undefined,
    })),
    currentMedications: ((medications ?? []) as MedicationRow[]).map((m) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      startDate: m.start_date,
      endDate: m.end_date ?? undefined,
      prescriber: m.prescriber ?? undefined,
      reminderTimes: m.reminder_times ?? [],
    })),
  };
}

export async function fetchTimelineEvents(
  supabase: SupabaseClient,
  userId: string
): Promise<TimelineEvent[]> {
  const { data } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("user_id", userId)
    .order("event_date", { ascending: true });

  return ((data ?? []) as TimelineRow[]).map((event) => ({
    id: event.id,
    userId: event.user_id,
    type: event.type,
    title: event.title,
    description: event.description ?? undefined,
    date: event.event_date,
    provider: event.provider ?? undefined,
    category: event.category ?? undefined,
  }));
}

export async function fetchHealthDocuments(
  supabase: SupabaseClient,
  userId: string
): Promise<HealthDocument[]> {
  const { data } = await supabase
    .from("health_documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return ((data ?? []) as DocumentRow[]).map((doc) => ({
    id: doc.id,
    userId: doc.user_id,
    name: doc.name,
    category: doc.category,
    fileUrl: doc.file_path,
    fileType: doc.file_type,
    fileSize: doc.file_size,
    uploadedAt: doc.created_at,
    tags: doc.tags ?? undefined,
  }));
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<Pick<HealthProfile, "fullName" | "dateOfBirth" | "bloodType" | "allergies" | "chronicIllnesses">>
) {
  const patch: Record<string, unknown> = {};

  if (updates.fullName !== undefined) patch.full_name = updates.fullName;
  if (updates.dateOfBirth !== undefined) patch.date_of_birth = updates.dateOfBirth || null;
  if (updates.bloodType !== undefined) patch.blood_type = updates.bloodType || null;
  if (updates.allergies !== undefined) patch.allergies = updates.allergies;
  if (updates.chronicIllnesses !== undefined) patch.chronic_illnesses = updates.chronicIllnesses;

  if (Object.keys(patch).length === 0) return { error: null };

  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  return { error };
}

export async function upsertHealthProfile(
  supabase: SupabaseClient,
  userId: string,
  profile: Pick<HealthProfile, "fullName" | "dateOfBirth" | "bloodType" | "allergies" | "chronicIllnesses">
) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      full_name: profile.fullName,
      date_of_birth: profile.dateOfBirth || null,
      blood_type: profile.bloodType || null,
      allergies: profile.allergies ?? [],
      chronic_illnesses: profile.chronicIllnesses ?? [],
    },
    { onConflict: "id" }
  );

  return { error };
}

export async function createTimelineEvent(
  supabase: SupabaseClient,
  userId: string,
  event: {
    type: TimelineEvent["type"];
    title: string;
    description?: string;
    date: string;
    provider?: string;
    category?: string;
  }
) {
  const { data, error } = await supabase
    .from("timeline_events")
    .insert({
      user_id: userId,
      type: event.type,
      title: event.title,
      description: event.description ?? null,
      event_date: event.date,
      provider: event.provider ?? null,
      category: event.category ?? null,
    })
    .select()
    .single();

  if (error || !data) return { error, event: null };

  const row = data as TimelineRow;
  return {
    error: null,
    event: {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      description: row.description ?? undefined,
      date: row.event_date,
      provider: row.provider ?? undefined,
      category: row.category ?? undefined,
    } satisfies TimelineEvent,
  };
}

export async function uploadHealthDocument(
  supabase: SupabaseClient,
  userId: string,
  file: File,
  category: string
) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${userId}/${Date.now()}-${safeName}`;
  const contentType = inferMimeType(file.name, file.type);

  const { error: uploadError } = await supabase.storage
    .from("health-documents")
    .upload(storagePath, file, { upsert: false, contentType });

  if (uploadError) return { error: uploadError, document: null };

  const { data, error } = await supabase
    .from("health_documents")
    .insert({
      user_id: userId,
      name: file.name,
      category,
      file_path: storagePath,
      file_type: contentType,
      file_size: file.size,
      tags: [],
    })
    .select()
    .single();

  if (error || !data) return { error, document: null };

  const row = data as DocumentRow;
  return {
    error: null,
    document: {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      category: row.category,
      fileUrl: row.file_path,
      fileType: row.file_type,
      fileSize: row.file_size,
      uploadedAt: row.created_at,
      tags: row.tags ?? undefined,
    } satisfies HealthDocument,
  };
}

export async function createShareLink(
  supabase: SupabaseClient,
  userId: string,
  input: {
    token: string;
    permissions: { type: string; scope: string }[];
    expiresAt: string;
  }
) {
  const { data, error } = await supabase
    .from("share_links")
    .insert({
      user_id: userId,
      token: input.token,
      permissions: input.permissions,
      expires_at: input.expiresAt,
      record_ids: [],
    })
    .select()
    .single();

  return { data, error };
}

export async function fetchShareLinkByToken(supabase: SupabaseClient, token: string) {
  const { data, error } = await supabase
    .from("share_links")
    .select("*")
    .eq("token", token)
    .eq("revoked", false)
    .maybeSingle();

  if (error || !data) return null;

  const expiresAt = new Date(data.expires_at);
  if (expiresAt < new Date()) return null;

  return data as {
    id: string;
    user_id: string;
    token: string;
    permissions: { type: string; scope: string }[];
    expires_at: string;
  };
}

export async function addMedication(
  supabase: SupabaseClient,
  userId: string,
  med: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    prescriber?: string;
    reminderTimes?: string[];
  }
) {
  const { data, error } = await supabase
    .from("medications")
    .insert({
      user_id: userId,
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      start_date: med.startDate,
      prescriber: med.prescriber ?? null,
      reminder_times: med.reminderTimes ?? [],
      active: true,
    })
    .select()
    .single();

  return { data, error };
}

interface FamilyRow {
  id: string;
  manager_id: string;
  name: string;
  relationship: string;
  date_of_birth: string | null;
}

export async function fetchFamilyMembers(supabase: SupabaseClient, managerId: string) {
  const { data, error } = await supabase
    .from("family_members")
    .select("*")
    .eq("manager_id", managerId)
    .order("created_at", { ascending: true });

  if (error) return { members: [], error };

  const members = ((data ?? []) as FamilyRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    relationship: row.relationship,
    dateOfBirth: row.date_of_birth ?? "",
    managedBy: row.manager_id,
  }));

  return { members, error: null };
}

export async function createFamilyMember(
  supabase: SupabaseClient,
  managerId: string,
  input: { name: string; relationship: string; dateOfBirth: string }
) {
  const { data, error } = await supabase
    .from("family_members")
    .insert({
      manager_id: managerId,
      name: input.name,
      relationship: input.relationship,
      date_of_birth: input.dateOfBirth || null,
    })
    .select()
    .single();

  if (error || !data) return { member: null, error };

  const row = data as FamilyRow;
  return {
    error: null,
    member: {
      id: row.id,
      name: row.name,
      relationship: row.relationship,
      dateOfBirth: row.date_of_birth ?? "",
      managedBy: row.manager_id,
    },
  };
}

export async function getHealthDocumentById(
  supabase: SupabaseClient,
  userId: string,
  documentId: string
) {
  const { data, error } = await supabase
    .from("health_documents")
    .select("*")
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as DocumentRow;
}

export async function createDocumentSignedUrl(
  supabase: SupabaseClient,
  filePath: string,
  expiresIn = 3600
) {
  const { data, error } = await supabase.storage
    .from("health-documents")
    .createSignedUrl(filePath, expiresIn);

  if (error || !data) return { url: null, error };
  return { url: data.signedUrl, error: null };
}

interface AppointmentRow {
  id: string;
  user_id: string;
  title: string;
  provider: string;
  appointment_date: string;
  location: string | null;
  notes: string | null;
}

interface ShareLinkRow {
  id: string;
  token: string;
  permissions: { type: string; scope: string }[];
  expires_at: string;
  created_at: string;
  revoked: boolean;
}

export async function createEmergencyContact(
  supabase: SupabaseClient,
  userId: string,
  contact: Omit<EmergencyContact, "id">
) {
  const { data, error } = await supabase
    .from("emergency_contacts")
    .insert({
      user_id: userId,
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email ?? null,
    })
    .select()
    .single();

  if (error || !data) return { contact: null, error };

  const row = data as ContactRow;
  return {
    error: null,
    contact: {
      id: row.id,
      name: row.name,
      relationship: row.relationship,
      phone: row.phone,
      email: row.email ?? undefined,
    } satisfies EmergencyContact,
  };
}

export async function deleteEmergencyContact(
  supabase: SupabaseClient,
  userId: string,
  contactId: string
) {
  const { error } = await supabase
    .from("emergency_contacts")
    .delete()
    .eq("id", contactId)
    .eq("user_id", userId);

  return { error };
}

export async function fetchAppointments(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("user_id", userId)
    .gte("appointment_date", new Date().toISOString())
    .order("appointment_date", { ascending: true });

  if (error) return { appointments: [] as Appointment[], error };

  const appointments = ((data ?? []) as AppointmentRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    provider: row.provider,
    date: row.appointment_date,
    location: row.location ?? undefined,
  }));

  return { appointments, error: null };
}

export async function createAppointment(
  supabase: SupabaseClient,
  userId: string,
  input: Omit<Appointment, "id">
) {
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      user_id: userId,
      title: input.title,
      provider: input.provider,
      appointment_date: input.date,
      location: input.location ?? null,
    })
    .select()
    .single();

  if (error || !data) return { appointment: null, error };

  const row = data as AppointmentRow;
  return {
    error: null,
    appointment: {
      id: row.id,
      title: row.title,
      provider: row.provider,
      date: row.appointment_date,
      location: row.location ?? undefined,
    } satisfies Appointment,
  };
}

export async function updateAppointment(
  supabase: SupabaseClient,
  userId: string,
  appointmentId: string,
  input: Omit<Appointment, "id">
) {
  const { data, error } = await supabase
    .from("appointments")
    .update({
      title: input.title,
      provider: input.provider,
      appointment_date: input.date,
      location: input.location ?? null,
    })
    .eq("id", appointmentId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error || !data) return { appointment: null, error };

  const row = data as AppointmentRow;
  return {
    error: null,
    appointment: {
      id: row.id,
      title: row.title,
      provider: row.provider,
      date: row.appointment_date,
      location: row.location ?? undefined,
    } satisfies Appointment,
  };
}

export async function deleteAppointment(
  supabase: SupabaseClient,
  userId: string,
  appointmentId: string
) {
  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", appointmentId)
    .eq("user_id", userId);

  return { error };
}

export async function deleteTimelineEvent(
  supabase: SupabaseClient,
  userId: string,
  eventId: string
) {
  const { error } = await supabase
    .from("timeline_events")
    .delete()
    .eq("id", eventId)
    .eq("user_id", userId);

  return { error };
}

export async function updateTimelineEvent(
  supabase: SupabaseClient,
  userId: string,
  eventId: string,
  updates: {
    type?: TimelineEvent["type"];
    title?: string;
    description?: string;
    date?: string;
    provider?: string;
    category?: string;
  }
) {
  const { data, error } = await supabase
    .from("timeline_events")
    .update({
      type: updates.type,
      title: updates.title,
      description: updates.description ?? null,
      event_date: updates.date,
      provider: updates.provider ?? null,
      category: updates.category ?? null,
    })
    .eq("id", eventId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error || !data) return { error, event: null };

  const row = data as TimelineRow;
  return {
    error: null,
    event: {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      description: row.description ?? undefined,
      date: row.event_date,
      provider: row.provider ?? undefined,
      category: row.category ?? undefined,
    } satisfies TimelineEvent,
  };
}

export async function deleteHealthDocument(
  supabase: SupabaseClient,
  userId: string,
  documentId: string
) {
  const doc = await getHealthDocumentById(supabase, userId, documentId);
  if (!doc) return { error: new Error("Document not found") };

  if (doc.file_path && !doc.file_path.startsWith("#")) {
    await supabase.storage.from("health-documents").remove([doc.file_path]);
  }

  const { error } = await supabase
    .from("health_documents")
    .delete()
    .eq("id", documentId)
    .eq("user_id", userId);

  return { error };
}

export async function updateMedication(
  supabase: SupabaseClient,
  userId: string,
  medicationId: string,
  med: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    prescriber?: string;
    reminderTimes?: string[];
  }
) {
  const { data, error } = await supabase
    .from("medications")
    .update({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      start_date: med.startDate,
      prescriber: med.prescriber ?? null,
      reminder_times: med.reminderTimes ?? [],
    })
    .eq("id", medicationId)
    .eq("user_id", userId)
    .select()
    .single();

  return { data, error };
}

export async function deactivateMedication(
  supabase: SupabaseClient,
  userId: string,
  medicationId: string
) {
  const { error } = await supabase
    .from("medications")
    .update({ active: false })
    .eq("id", medicationId)
    .eq("user_id", userId);

  return { error };
}

export async function fetchShareLinks(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("share_links")
    .select("*")
    .eq("user_id", userId)
    .eq("revoked", false)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) return { links: [] as ShareLink[], error };

  const links = ((data ?? []) as ShareLinkRow[]).map((row) => ({
    id: row.id,
    token: row.token,
    expiresAt: row.expires_at,
    permissions: row.permissions.map((p) => ({
      type: p.type as "view" | "download",
      scope: p.scope as ShareLink["permissions"][0]["scope"],
    })),
    recordIds: [],
    createdAt: row.created_at,
  }));

  return { links, error: null };
}

export async function revokeShareLink(
  supabase: SupabaseClient,
  userId: string,
  token: string
) {
  const { error } = await supabase
    .from("share_links")
    .update({ revoked: true })
    .eq("token", token)
    .eq("user_id", userId);

  return { error };
}

export type { Medication };
