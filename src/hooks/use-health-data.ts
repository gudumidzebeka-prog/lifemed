"use client";



import { useCallback, useEffect, useState } from "react";

import {

  demoAppointments,

  demoDocuments,

  demoFamilyMembers,

  demoProfile,

  demoTimeline,

} from "@/data/demo-data";

import {

  addMedication as dbAddMedication,

  createAppointment,

  createEmergencyContact,

  createFamilyMember,

  createTimelineEvent,

  createDocumentSignedUrl,

  deactivateMedication,

  deleteAppointment,

  deleteEmergencyContact,

  deleteHealthDocument,

  deleteTimelineEvent,

  fetchAppointments,

  fetchFamilyMembers,

  fetchHealthDocuments,

  fetchHealthProfile,

  fetchTimelineEvents,

  updateTimelineEvent,

  updateAppointment,

  updateEmergencyContact,

  updateFamilyMember,

  uploadFamilyMemberAvatar as dbUploadFamilyMemberAvatar,

  removeFamilyMemberAvatar as dbRemoveFamilyMemberAvatar,

  updateMedication,

  uploadHealthDocument,

  uploadProfileAvatar as dbUploadProfileAvatar,

  removeProfileAvatar as dbRemoveProfileAvatar,

  upsertProfileContactFields,

} from "@/lib/health/db";

import { createClient } from "@/lib/supabase/client";

import { createClientFromConfig, configureSupabaseRuntimeHint, resolveSupabaseConfig } from "@/lib/supabase/runtime-client";

import { isSupabaseConfigured } from "@/lib/supabase/config";

import { EMPTY_PROFILE, emptyLiveProfile } from "@/lib/health/empty-profile";

import {
  mergeMedicationReminderTimes,
  setMedicationReminderTimes,
} from "@/lib/health/medication-reminder-storage";

import { sanitizeReminderTimes } from "@/lib/health/medication-reminders";
import {
  loadCachedProfileFields,
  mergeProfileWithCache,
  saveCachedProfileFields,
} from "@/lib/health/profile-local-cache";
import {
  loadCachedFamilyMembers,
  mergeFamilyMembersWithCache,
  saveCachedFamilyMembers,
} from "@/lib/health/family-local-cache";
import { normalizeDateOfBirth } from "@/lib/health/profile-dates";
import { withAuthContact, syncProfileContactToAuth, persistProfileUpdates } from "@/lib/health/profile-contact";
import { inferMimeType } from "@/lib/health/mime";

import type {
  Appointment,

  EmergencyContact,

  FamilyMember,

  HealthDocument,

  HealthProfile,

  Medication,

  ShareLink,

  TimelineEvent,

} from "@/types/health";



export type DataMode = "demo" | "live";



const APPOINTMENTS_KEY = "lifemed-appointments";



function newLocalId() {

  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

}



function getInitialProfile(supabaseConfigured: boolean) {
  if (supabaseConfigured) return EMPTY_PROFILE;
  const cached = loadCachedProfileFields(null);
  if (cached) {
    return { ...demoProfile, ...cached, id: demoProfile.id, userId: demoProfile.userId };
  }
  return demoProfile;
}

function getInitialTimeline(supabaseConfigured: boolean) {
  return supabaseConfigured ? [] : demoTimeline;
}

function getInitialDocuments(supabaseConfigured: boolean) {
  return supabaseConfigured ? [] : demoDocuments;
}

function getInitialFamilyMembers(supabaseConfigured: boolean) {
  if (supabaseConfigured) return [];
  const cached = loadCachedFamilyMembers(null);
  return cached.length > 0 ? cached : demoFamilyMembers;
}

function getInitialAppointments(supabaseConfigured: boolean) {
  return supabaseConfigured ? [] : demoAppointments;
}

function loadLocalAppointments(supabaseConfigured: boolean): Appointment[] {

  if (typeof window === "undefined") return getInitialAppointments(supabaseConfigured);

  if (supabaseConfigured) return [];

  try {

    const raw = localStorage.getItem(APPOINTMENTS_KEY);

    if (!raw) return demoAppointments;

    return JSON.parse(raw) as Appointment[];

  } catch {

    return demoAppointments;

  }

}



function saveLocalAppointments(appointments: Appointment[]) {

  if (typeof window === "undefined") return;

  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));

}



function applyDemoData(
  supabaseConfigured: boolean,
  setters: {
    setMode: (mode: DataMode) => void;
    setProfile: (profile: HealthProfile) => void;
    setTimeline: (timeline: TimelineEvent[]) => void;
    setDocuments: (documents: HealthDocument[]) => void;
    setFamilyMembers: (members: FamilyMember[]) => void;
    setAppointments: (appointments: Appointment[]) => void;
    setUserId: (userId: string | null) => void;
  }
) {
  if (supabaseConfigured) {
    setters.setMode("live");
    setters.setProfile(EMPTY_PROFILE);
    setters.setTimeline([]);
    setters.setDocuments([]);
    setters.setFamilyMembers([]);
    setters.setAppointments([]);
    setters.setUserId(null);
    return;
  }

  setters.setMode("demo");
  setters.setProfile(withMedicationReminders(demoProfile));
  setters.setTimeline(demoTimeline);
  setters.setDocuments(demoDocuments);
  setters.setFamilyMembers(demoFamilyMembers);
  setters.setAppointments(loadLocalAppointments(false));
  setters.setUserId(null);
}



function withMedicationReminders(profile: HealthProfile): HealthProfile {
  return {
    ...profile,
    currentMedications: mergeMedicationReminderTimes(profile.currentMedications),
  };
}

type ProfileFieldUpdates = Partial<
  Pick<
    HealthProfile,
    | "fullName"
    | "dateOfBirth"
    | "email"
    | "phone"
    | "city"
    | "gender"
    | "bloodType"
    | "allergies"
    | "chronicIllnesses"
  >
>;

function applyProfileFieldUpdates(profile: HealthProfile, updates: ProfileFieldUpdates): HealthProfile {
  const next = { ...profile };

  if (updates.fullName !== undefined) {
    next.fullName = updates.fullName;
  }
  if (updates.dateOfBirth !== undefined) {
    next.dateOfBirth = normalizeDateOfBirth(updates.dateOfBirth);
  }
  if (updates.email !== undefined) {
    next.email = updates.email.trim() || undefined;
  }
  if (updates.phone !== undefined) {
    next.phone = updates.phone.trim() || undefined;
  }
  if (updates.city !== undefined) {
    next.city = updates.city.trim() || undefined;
  }
  if (updates.gender !== undefined) {
    next.gender = updates.gender || undefined;
  }
  if (updates.bloodType !== undefined) {
    next.bloodType = updates.bloodType.trim() ? updates.bloodType.trim() : undefined;
  }
  if (updates.allergies !== undefined) {
    next.allergies = updates.allergies;
  }
  if (updates.chronicIllnesses !== undefined) {
    next.chronicIllnesses = updates.chronicIllnesses;
  }

  return next;
}

async function resolveLiveUserId(
  mode: DataMode,
  userId: string | null,
  setUserId: (userId: string | null) => void
): Promise<string | null> {
  if (mode !== "live" || !isSupabaseConfigured()) return null;
  if (userId) return userId;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id) {
    setUserId(user.id);
    return user.id;
  }

  return null;
}



export function useHealthData(serverSupabaseConfigured = isSupabaseConfigured()) {

  const [mode, setMode] = useState<DataMode>(serverSupabaseConfigured ? "live" : "demo");

  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<HealthProfile>(() => getInitialProfile(serverSupabaseConfigured));

  const [timeline, setTimeline] = useState<TimelineEvent[]>(() => getInitialTimeline(serverSupabaseConfigured));

  const [documents, setDocuments] = useState<HealthDocument[]>(() => getInitialDocuments(serverSupabaseConfigured));

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => getInitialFamilyMembers(serverSupabaseConfigured));

  const [appointments, setAppointments] = useState<Appointment[]>(() => getInitialAppointments(serverSupabaseConfigured));

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    configureSupabaseRuntimeHint(serverSupabaseConfigured);
  }, [serverSupabaseConfigured]);

  const reload = useCallback(async () => {

    const config = await resolveSupabaseConfig();

    const supabaseConfigured = config.supabase || serverSupabaseConfigured;



    if (!supabaseConfigured) {

      applyDemoData(false, {

        setMode,

        setProfile,

        setTimeline,

        setDocuments,

        setFamilyMembers,

        setAppointments,

        setUserId,

      });

      setLoading(false);

      return;

    }



    setLoading(true);



    try {

      const clientConfig = {
        supabase: supabaseConfigured,
      };

      const supabase = createClientFromConfig(clientConfig);

      const {

        data: { user },

      } = await supabase.auth.getUser();



      if (!user) {

        applyDemoData(true, {

          setMode,

          setProfile,

          setTimeline,

          setDocuments,

          setFamilyMembers,

          setAppointments,

          setUserId,

        });

        return;

      }



      setUserId(user.id);

      setMode("live");



      const [liveProfile, liveTimeline, liveDocuments, familyResult, aptResult] =

        await Promise.all([

          fetchHealthProfile(supabase, user.id),

          fetchTimelineEvents(supabase, user.id),

          fetchHealthDocuments(supabase, user.id),

          fetchFamilyMembers(supabase, user.id),

          fetchAppointments(supabase, user.id),

        ]);



      const baseProfile = withAuthContact(liveProfile ?? emptyLiveProfile(user), user);
      const mergedProfile = mergeProfileWithCache(baseProfile, user.id);

      setProfile(withMedicationReminders(mergedProfile));

      const shouldHealProfile =
        mergedProfile.dateOfBirth !== (baseProfile.dateOfBirth ?? "") ||
        mergedProfile.fullName !== baseProfile.fullName ||
        (mergedProfile.email ?? "") !== (baseProfile.email ?? "") ||
        (mergedProfile.phone ?? "") !== (baseProfile.phone ?? "") ||
        (mergedProfile.city ?? "") !== (baseProfile.city ?? "") ||
        (mergedProfile.gender ?? "") !== (baseProfile.gender ?? "") ||
        (mergedProfile.bloodType ?? "") !== (baseProfile.bloodType ?? "") ||
        JSON.stringify(mergedProfile.allergies) !== JSON.stringify(baseProfile.allergies) ||
        JSON.stringify(mergedProfile.chronicIllnesses) !==
          JSON.stringify(baseProfile.chronicIllnesses);

      if (shouldHealProfile) {
        await persistProfileUpdates(supabase, user.id, {
          fullName: mergedProfile.fullName,
          dateOfBirth: mergedProfile.dateOfBirth,
          city: mergedProfile.city,
          gender: mergedProfile.gender,
          bloodType: mergedProfile.bloodType,
          allergies: mergedProfile.allergies,
          chronicIllnesses: mergedProfile.chronicIllnesses,
        });
        await upsertProfileContactFields(supabase, user.id, {
          email: mergedProfile.email,
          phone: mergedProfile.phone,
        });
      }

      setTimeline(liveTimeline);

      setDocuments(liveDocuments);

      if (!familyResult.error) {
        setFamilyMembers(mergeFamilyMembersWithCache(familyResult.members, user.id));
      }

      if (!aptResult.error) setAppointments(aptResult.appointments);

    } catch {

      applyDemoData(true, {

        setMode,

        setProfile,

        setTimeline,

        setDocuments,

        setFamilyMembers,

        setAppointments,

        setUserId,

      });

    } finally {

      setLoading(false);

    }

  }, [serverSupabaseConfigured]);



  useEffect(() => {

    reload();

  }, [reload]);



  useEffect(() => {
    if (loading) return;
    saveCachedFamilyMembers(userId, familyMembers);
  }, [familyMembers, userId, loading]);



  const addTimelineEvent = useCallback(

    async (event: {

      type: TimelineEvent["type"];

      title: string;

      description?: string;

      date: string;

      provider?: string;

      category?: string;

    }) => {

      if (mode === "live" && userId && isSupabaseConfigured()) {

        const supabase = createClient();

        const { error, event: created } = await createTimelineEvent(supabase, userId, event);

        if (error) return { error: error.message };

        if (created) setTimeline((prev) => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)));

        return { error: null };

      }



      const local: TimelineEvent = {

        id: newLocalId(),

        userId: userId ?? "demo",

        ...event,

      };

      setTimeline((prev) => [...prev, local].sort((a, b) => a.date.localeCompare(b.date)));

      return { error: null };

    },

    [mode, userId]

  );



  const removeTimelineEvent = useCallback(

    async (eventId: string) => {

      setTimeline((prev) => prev.filter((e) => e.id !== eventId));



      if (mode === "live" && userId && isSupabaseConfigured()) {

        const supabase = createClient();

        const { error } = await deleteTimelineEvent(supabase, userId, eventId);

        if (error) return { error: error.message };

      }



      return { error: null };

    },

    [mode, userId]

  );



  const editTimelineEvent = useCallback(

    async (

      eventId: string,

      updates: {

        type?: TimelineEvent["type"];

        title?: string;

        description?: string;

        date?: string;

        provider?: string;

        category?: string;

      }

    ) => {

      if (mode === "live" && userId && isSupabaseConfigured()) {

        const supabase = createClient();

        const { error, event: updated } = await updateTimelineEvent(

          supabase,

          userId,

          eventId,

          updates

        );

        if (error) return { error: error.message };

        if (updated) {

          setTimeline((prev) =>

            prev

              .map((e) => (e.id === eventId ? updated : e))

              .sort((a, b) => a.date.localeCompare(b.date))

          );

        }

        return { error: null };

      }



      setTimeline((prev) =>

        prev

          .map((e) => (e.id === eventId ? { ...e, ...updates } : e))

          .sort((a, b) => a.date.localeCompare(b.date))

      );

      return { error: null };

    },

    [mode, userId]

  );



  const saveProfile = useCallback(

    async (updates: ProfileFieldUpdates) => {

      const previous = profile;

      const next = applyProfileFieldUpdates(profile, updates);

      setProfile(next);



      const liveUserId = await resolveLiveUserId(mode, userId, setUserId);

      saveCachedProfileFields(liveUserId ?? userId, next);



      if (mode === "live" && liveUserId && isSupabaseConfigured()) {

        const supabase = createClient();

        const { error } = await persistProfileUpdates(supabase, liveUserId, updates);

        if (error) {

          setProfile(previous);

          saveCachedProfileFields(liveUserId ?? userId, previous);

          return { error: error.message };

        }

        if (updates.phone !== undefined || updates.email !== undefined) {
          await syncProfileContactToAuth(supabase, {
            phone: next.phone,
            email: next.email,
          });
          await upsertProfileContactFields(supabase, liveUserId, {
            email: next.email,
            phone: next.phone,
          });
        }

      }



      return { error: null };

    },

    [mode, userId, profile]

  );



  const addAllergy = useCallback(

    async (allergy: string) => {

      const trimmed = allergy.trim();

      if (!trimmed || profile.allergies.includes(trimmed)) {

        return { error: null };

      }

      return saveProfile({ allergies: [...profile.allergies, trimmed] });

    },

    [profile.allergies, saveProfile]

  );



  const removeAllergy = useCallback(

    async (allergy: string) => {

      return saveProfile({ allergies: profile.allergies.filter((a) => a !== allergy) });

    },

    [profile.allergies, saveProfile]

  );



  const addChronicIllness = useCallback(

    async (illness: string) => {

      const trimmed = illness.trim();

      if (!trimmed || profile.chronicIllnesses.includes(trimmed)) {

        return { error: null };

      }

      return saveProfile({ chronicIllnesses: [...profile.chronicIllnesses, trimmed] });

    },

    [profile.chronicIllnesses, saveProfile]

  );



  const removeChronicIllness = useCallback(

    async (illness: string) => {

      return saveProfile({

        chronicIllnesses: profile.chronicIllnesses.filter((item) => item !== illness),

      });

    },

    [profile.chronicIllnesses, saveProfile]

  );



  const addEmergencyContact = useCallback(

    async (contact: Omit<EmergencyContact, "id">) => {

      const local: EmergencyContact = { id: newLocalId(), ...contact };

      setProfile((prev) => ({

        ...prev,

        emergencyContacts: [...prev.emergencyContacts, local],

      }));



      if (mode === "live" && userId && isSupabaseConfigured()) {

        const supabase = createClient();

        const { contact: created, error } = await createEmergencyContact(supabase, userId, contact);

        if (error) {

          setProfile((prev) => ({

            ...prev,

            emergencyContacts: prev.emergencyContacts.filter((c) => c.id !== local.id),

          }));

          return { error: error.message };

        }

        if (created) {

          setProfile((prev) => ({

            ...prev,

            emergencyContacts: prev.emergencyContacts.map((c) =>

              c.id === local.id ? created : c

            ),

          }));

        }

      }



      return { error: null };

    },

    [mode, userId]

  );



  const editEmergencyContact = useCallback(

    async (contactId: string, contact: Omit<EmergencyContact, "id">) => {

      const prevContacts = profile.emergencyContacts;

      setProfile((prev) => ({

        ...prev,

        emergencyContacts: prev.emergencyContacts.map((item) =>

          item.id === contactId ? { ...item, ...contact } : item

        ),

      }));



      if (mode === "live" && userId && isSupabaseConfigured()) {

        const supabase = createClient();

        const { contact: updated, error } = await updateEmergencyContact(

          supabase,

          userId,

          contactId,

          contact

        );

        if (error) {

          setProfile((prev) => ({ ...prev, emergencyContacts: prevContacts }));

          return { error: error.message };

        }

        if (updated) {

          setProfile((prev) => ({

            ...prev,

            emergencyContacts: prev.emergencyContacts.map((item) =>

              item.id === contactId ? updated : item

            ),

          }));

        }

      }



      return { error: null };

    },

    [mode, userId, profile.emergencyContacts]

  );



  const removeEmergencyContact = useCallback(

    async (contactId: string) => {

      const prevContacts = profile.emergencyContacts;

      setProfile((prev) => ({

        ...prev,

        emergencyContacts: prev.emergencyContacts.filter((c) => c.id !== contactId),

      }));



      if (mode === "live" && userId && isSupabaseConfigured()) {

        const supabase = createClient();

        const { error } = await deleteEmergencyContact(supabase, userId, contactId);

        if (error) {

          setProfile((prev) => ({ ...prev, emergencyContacts: prevContacts }));

          return { error: error.message };

        }

      }



      return { error: null };

    },

    [mode, userId, profile.emergencyContacts]

  );



  const uploadDocument = useCallback(

    async (file: File, category: string) => {

      if (mode === "live" && userId && isSupabaseConfigured()) {

        const supabase = createClient();

        const { error, document } = await uploadHealthDocument(supabase, userId, file, category);

        if (error) return { error: error.message };

        if (document) setDocuments((prev) => [document, ...prev]);

        return { error: null };

      }



      const local: HealthDocument = {

        id: newLocalId(),

        userId: userId ?? "demo",

        name: file.name,

        category,

        fileUrl: URL.createObjectURL(file),

        fileType: inferMimeType(file.name, file.type),

        fileSize: file.size,

        uploadedAt: new Date().toISOString(),

      };

      setDocuments((prev) => [local, ...prev]);

      return { error: null };

    },

    [mode, userId]

  );



  const removeDocument = useCallback(

    async (documentId: string) => {

      setDocuments((prev) => prev.filter((d) => d.id !== documentId));



      if (mode === "live" && userId && isSupabaseConfigured()) {

        const supabase = createClient();

        const { error } = await deleteHealthDocument(supabase, userId, documentId);

        if (error) return { error: error.message };

      }



      return { error: null };

    },

    [mode, userId]

  );



  const addMedication = useCallback(

    async (med: {

      name: string;

      dosage: string;

      frequency: string;

      startDate: string;

      prescriber?: string;

      reminderTimes?: string[];

    }) => {

      const reminderTimes = sanitizeReminderTimes(med.reminderTimes ?? []);

      const localMed: Medication = {

        id: newLocalId(),

        ...med,

        reminderTimes,

      };



      setMedicationReminderTimes(localMed.id, reminderTimes);



      setProfile((prev) => ({

        ...prev,

        currentMedications: [...prev.currentMedications, localMed],

      }));



      if (mode === "live" && userId && isSupabaseConfigured()) {

        const supabase = createClient();

        const { data, error } = await dbAddMedication(supabase, userId, { ...med, reminderTimes });

        if (error) {

          setProfile((prev) => ({

            ...prev,

            currentMedications: prev.currentMedications.filter((m) => m.id !== localMed.id),

          }));

          return { error: error.message };

        }

        if (data) {

          const row = data as { id: string };

          setProfile((prev) => ({

            ...prev,

            currentMedications: prev.currentMedications.map((m) =>

              m.id === localMed.id ? { ...m, id: row.id } : m

            ),

          }));

        }

      }



      return { error: null };

    },

    [mode, userId]

  );



  const removeMedication = useCallback(

    async (medicationId: string) => {

      const prevMeds = profile.currentMedications;

      setProfile((prev) => ({

        ...prev,

        currentMedications: prev.currentMedications.filter((m) => m.id !== medicationId),

      }));



      if (mode === "live" && userId && isSupabaseConfigured()) {

        const supabase = createClient();

        const { error } = await deactivateMedication(supabase, userId, medicationId);

        if (error) {

          setProfile((prev) => ({ ...prev, currentMedications: prevMeds }));

          return { error: error.message };

        }

      }



      return { error: null };

    },

    [mode, userId, profile.currentMedications]

  );



  const editMedication = useCallback(

    async (

      medicationId: string,

      med: {

        name: string;

        dosage: string;

        frequency: string;

        startDate: string;

        prescriber?: string;

        reminderTimes?: string[];

      }

    ) => {

      const reminderTimes = sanitizeReminderTimes(med.reminderTimes ?? []);

      const payload = { ...med, reminderTimes };

      const prevMeds = profile.currentMedications;

      setMedicationReminderTimes(medicationId, reminderTimes);



      setProfile((prev) => ({

        ...prev,

        currentMedications: prev.currentMedications.map((m) =>

          m.id === medicationId ? { ...m, ...payload } : m

        ),

      }));



      if (mode === "live" && userId && isSupabaseConfigured()) {

        const supabase = createClient();

        const { error } = await updateMedication(supabase, userId, medicationId, payload);

        if (error) {

          setProfile((prev) => ({ ...prev, currentMedications: prevMeds }));

          return { error: error.message };

        }

      }



      return { error: null };

    },

    [mode, userId, profile.currentMedications]

  );



  const addAppointment = useCallback(

    async (input: Omit<Appointment, "id">) => {

      const local: Appointment = { id: newLocalId(), ...input };



      setAppointments((prev) => {

        const next = [...prev, local].sort((a, b) => a.date.localeCompare(b.date));

        if (mode === "demo") saveLocalAppointments(next);

        return next;

      });



      if (mode === "live" && userId && isSupabaseConfigured()) {

        const supabase = createClient();

        const { appointment, error } = await createAppointment(supabase, userId, input);

        if (error) {

          setAppointments((prev) => prev.filter((a) => a.id !== local.id));

          return { error: error.message };

        }

        if (appointment) {

          setAppointments((prev) =>

            prev.map((a) => (a.id === local.id ? appointment : a)).sort((a, b) => a.date.localeCompare(b.date))

          );

        }

      }



      return { error: null };

    },

    [mode, userId]

  );



  const removeAppointment = useCallback(

    async (appointmentId: string) => {

      setAppointments((prev) => {

        const next = prev.filter((a) => a.id !== appointmentId);

        if (mode === "demo") saveLocalAppointments(next);

        return next;

      });



      if (mode === "live" && userId && isSupabaseConfigured()) {

        const supabase = createClient();

        const { error } = await deleteAppointment(supabase, userId, appointmentId);

        if (error) return { error: error.message };

      }



      return { error: null };

    },

    [mode, userId]

  );



  const editAppointment = useCallback(

    async (appointmentId: string, input: Omit<Appointment, "id">) => {

      const prevAppointments = appointments;

      setAppointments((prev) => {

        const next = prev

          .map((a) => (a.id === appointmentId ? { ...a, ...input } : a))

          .sort((a, b) => a.date.localeCompare(b.date));

        if (mode === "demo") saveLocalAppointments(next);

        return next;

      });



      if (mode === "live" && userId && isSupabaseConfigured()) {

        const supabase = createClient();

        const { appointment, error } = await updateAppointment(supabase, userId, appointmentId, input);

        if (error) {

          setAppointments(prevAppointments);

          return { error: error.message };

        }

        if (appointment) {

          setAppointments((prev) =>

            prev.map((a) => (a.id === appointmentId ? appointment : a)).sort((a, b) => a.date.localeCompare(b.date))

          );

        }

      }



      return { error: null };

    },

    [appointments, mode, userId]

  );



  const addFamilyMember = useCallback(

    async (input: { name: string; relationship: string; dateOfBirth: string }) => {

      const local: FamilyMember = {

        id: newLocalId(),

        ...input,

        managedBy: userId ?? "demo",

      };



      setFamilyMembers((prev) => [...prev, local]);



      if (mode === "live" && userId && isSupabaseConfigured()) {

        const supabase = createClient();

        const { member, error } = await createFamilyMember(supabase, userId, input);

        if (error) {

          setFamilyMembers((prev) => prev.filter((m) => m.id !== local.id));

          return { error: error.message, member: null };

        }

        if (member) {

          setFamilyMembers((prev) =>

            prev.map((m) => (m.id === local.id ? member : m))

          );

          return { error: null, member };

        }

      }



      return { error: null, member: local };

    },

    [mode, userId]

  );



  const editFamilyMember = useCallback(

    async (

      memberId: string,

      input: { name: string; relationship: string; dateOfBirth: string }

    ) => {

      const prevMembers = familyMembers;

      setFamilyMembers((prev) =>

        prev.map((member) => (member.id === memberId ? { ...member, ...input } : member))

      );



      if (mode === "live" && userId && isSupabaseConfigured()) {

        const supabase = createClient();

        const { member, error } = await updateFamilyMember(supabase, userId, memberId, input);

        if (error) {

          setFamilyMembers(prevMembers);

          return { error: error.message };

        }



        if (member) {

          setFamilyMembers((prev) => prev.map((m) => (m.id === memberId ? member : m)));

        }

      }



      return { error: null };

    },

    [familyMembers, mode, userId]

  );



  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(file);
    });



  const uploadFamilyMemberAvatar = useCallback(
    async (memberId: string, file: File) => {
      let dataUrl: string;
      try {
        dataUrl = await readFileAsDataUrl(file);
      } catch {
        return { error: "Failed to read image" };
      }

      if (mode === "live" && userId && isSupabaseConfigured()) {
        const supabase = createClient();
        const { error, avatarUrl } = await dbUploadFamilyMemberAvatar(
          supabase,
          userId,
          memberId,
          file
        );

        if (!error && avatarUrl) {
          setFamilyMembers((prev) =>
            prev.map((member) =>
              member.id === memberId ? { ...member, avatarUrl } : member
            )
          );
          return { error: null };
        }
      }

      setFamilyMembers((prev) =>
        prev.map((member) =>
          member.id === memberId ? { ...member, avatarUrl: dataUrl } : member
        )
      );
      return { error: null };
    },
    [mode, userId]
  );

  const removeFamilyMemberAvatar = useCallback(
    async (memberId: string) => {
      const previous = familyMembers.find((member) => member.id === memberId);
      if (!previous) return { error: null };

      setFamilyMembers((prev) =>
        prev.map((member) =>
          member.id === memberId ? { ...member, avatarUrl: undefined } : member
        )
      );

      if (mode === "live" && userId && isSupabaseConfigured()) {
        const supabase = createClient();
        const { error } = await dbRemoveFamilyMemberAvatar(
          supabase,
          userId,
          memberId,
          previous.avatarUrl
        );

        if (error) {
          setFamilyMembers((prev) =>
            prev.map((member) => (member.id === memberId ? previous : member))
          );
          return { error: error.message };
        }
      }

      return { error: null };
    },
    [familyMembers, mode, userId]
  );



  const uploadProfileAvatar = useCallback(
    async (file: File) => {
      const previous = profile;

      if (mode === "live" && userId && isSupabaseConfigured()) {
        const supabase = createClient();
        const { error, avatarUrl } = await dbUploadProfileAvatar(supabase, userId, file);

        if (error) return { error: error.message };

        const next = { ...profile, avatarUrl: avatarUrl ?? undefined };
        setProfile(next);
        saveCachedProfileFields(userId, next);
        return { error: null };
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        const next = { ...profile, avatarUrl: dataUrl };
        setProfile(next);
        saveCachedProfileFields(userId, next);
        return { error: null };
      } catch {
        setProfile(previous);
        return { error: "Failed to read image" };
      }
    },
    [mode, userId, profile]
  );


  const removeProfileAvatar = useCallback(async () => {
    const previous = profile;
    const next = { ...profile, avatarUrl: undefined };
    setProfile(next);
    saveCachedProfileFields(userId, next);

    if (mode === "live" && userId && isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await dbRemoveProfileAvatar(supabase, userId, previous.avatarUrl);

      if (error) {
        setProfile(previous);
        saveCachedProfileFields(userId, previous);
        return { error: error.message };
      }
    }

    return { error: null };
  }, [mode, userId, profile]);


  const resolveAvatarUrl = useCallback(
    async (avatarPath: string): Promise<{ url: string | null; error: string | null }> => {
      if (!avatarPath) return { url: null, error: null };

      if (avatarPath.startsWith("blob:") || avatarPath.startsWith("data:")) {
        return { url: avatarPath, error: null };
      }

      if (mode === "live" && userId && isSupabaseConfigured()) {
        const supabase = createClient();
        const { url, error } = await createDocumentSignedUrl(supabase, avatarPath);
        if (error) return { url: null, error: error.message };
        return { url, error: null };
      }

      return { url: null, error: null };
    },
    [mode, userId]
  );


  const resolveDocumentUrl = useCallback(

    async (doc: HealthDocument): Promise<{ url: string | null; error: string | null }> => {

      if (doc.fileUrl === "#") {

        return { url: null, error: "Preview only for demo sample files" };

      }



      if (doc.fileUrl.startsWith("blob:")) {

        return { url: doc.fileUrl, error: null };

      }



      if (mode === "live" && isSupabaseConfigured() && !doc.id.startsWith("local-")) {

        try {

          const res = await fetch(`/api/documents/${doc.id}/download`);

          const data = (await res.json()) as { url?: string; error?: string };

          if (!res.ok || !data.url) {

            return { url: null, error: data.error ?? "Download failed" };

          }

          return { url: data.url, error: null };

        } catch {

          return { url: null, error: "Download failed" };

        }

      }



      return { url: null, error: "Preview only for demo sample files" };

    },

    [mode]

  );



  const downloadDocument = useCallback(

    async (doc: HealthDocument) => {

      const { url, error } = await resolveDocumentUrl(doc);

      if (error || !url) return { error: error ?? "Download failed" };



      try {

        if (url.startsWith("blob:")) {

          const a = document.createElement("a");

          a.href = url;

          a.download = doc.name;

          document.body.appendChild(a);

          a.click();

          a.remove();

          return { error: null };

        }



        const response = await fetch(url);

        if (!response.ok) return { error: "Download failed" };

        const blob = await response.blob();

        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = blobUrl;

        a.download = doc.name;

        document.body.appendChild(a);

        a.click();

        a.remove();

        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

        return { error: null };

      } catch {

        window.location.assign(url);

        return { error: null };

      }

    },

    [resolveDocumentUrl]

  );



  const exportHealthData = useCallback(() => {

    const payload = {

      exportedAt: new Date().toISOString(),

      mode,

      profile,

      timeline,

      documents: documents.map((d) => ({ ...d, fileUrl: undefined })),

      appointments,

      familyMembers,

    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = `lifemed-export-${new Date().toISOString().slice(0, 10)}.json`;

    a.click();

    URL.revokeObjectURL(url);

  }, [mode, profile, timeline, documents, appointments, familyMembers]);



  const revokeShareLink = useCallback(async (token: string) => {

    try {

      const res = await fetch(`/api/share?token=${encodeURIComponent(token)}`, {

        method: "DELETE",

      });

      if (!res.ok) {

        const data = await res.json();

        return { error: data.error ?? "Revoke failed" };

      }

      return { error: null };

    } catch {

      return { error: "Revoke failed" };

    }

  }, []);



  const fetchShareLinks = useCallback(async (): Promise<ShareLink[]> => {

    try {

      const res = await fetch("/api/share");

      const data = await res.json();

      if (!res.ok) return [];

      return (data.links ?? []) as ShareLink[];

    } catch {

      return [];

    }

  }, []);



  return {

    mode,

    loading,

    profile,

    timeline,

    documents,

    familyMembers,

    appointments,

    userId,

    reload,

    isDemo: mode === "demo",

    isLive: mode === "live",

    addTimelineEvent,

    removeTimelineEvent,

    editTimelineEvent,

    saveProfile,

    addAllergy,

    removeAllergy,

    addChronicIllness,

    removeChronicIllness,

    addEmergencyContact,

    editEmergencyContact,

    removeEmergencyContact,

    uploadDocument,

    removeDocument,

    addMedication,

    editMedication,

    removeMedication,

    addAppointment,

    editAppointment,

    removeAppointment,

    addFamilyMember,

    editFamilyMember,

    uploadFamilyMemberAvatar,

    removeFamilyMemberAvatar,

    downloadDocument,

    uploadProfileAvatar,

    removeProfileAvatar,

    resolveAvatarUrl,

    resolveDocumentUrl,

    exportHealthData,

    revokeShareLink,

    fetchShareLinks,

  };

}


