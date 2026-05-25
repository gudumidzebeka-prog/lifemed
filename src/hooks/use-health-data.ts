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

  updateProfile,

  updateTimelineEvent,

  uploadHealthDocument,

} from "@/lib/health/db";

import { createClient } from "@/lib/supabase/client";

import { createClientFromConfig, configureSupabaseRuntimeHint, resolveSupabaseConfig } from "@/lib/supabase/runtime-client";

import { isSupabaseConfigured } from "@/lib/supabase/config";

import { EMPTY_PROFILE, emptyLiveProfile } from "@/lib/health/empty-profile";
import { clearDemoSeedFromAccount, accountHasDemoSeedData } from "@/lib/health/demo-seed";

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
  return supabaseConfigured ? EMPTY_PROFILE : demoProfile;
}

function getInitialTimeline(supabaseConfigured: boolean) {
  return supabaseConfigured ? [] : demoTimeline;
}

function getInitialDocuments(supabaseConfigured: boolean) {
  return supabaseConfigured ? [] : demoDocuments;
}

function getInitialFamilyMembers(supabaseConfigured: boolean) {
  return supabaseConfigured ? [] : demoFamilyMembers;
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
  setters.setProfile(demoProfile);
  setters.setTimeline(demoTimeline);
  setters.setDocuments(demoDocuments);
  setters.setFamilyMembers(demoFamilyMembers);
  setters.setAppointments(loadLocalAppointments(false));
  setters.setUserId(null);
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
        supabaseUrl: config.supabaseUrl,
        supabaseAnonKey: config.supabaseAnonKey,
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



      setProfile(liveProfile ?? emptyLiveProfile(user));

      setTimeline(liveTimeline);

      setDocuments(liveDocuments);

      if (!familyResult.error) setFamilyMembers(familyResult.members);

      if (!aptResult.error) setAppointments(aptResult.appointments);

      if (
        accountHasDemoSeedData({
          profile: liveProfile,
          timeline: liveTimeline,
          documents: liveDocuments,
          familyMembers: familyResult.error ? [] : familyResult.members,
          appointments: aptResult.error ? [] : aptResult.appointments,
        })
      ) {
        const cleared = await clearDemoSeedFromAccount();
        if (cleared) {
          const [freshProfile, freshTimeline, freshDocuments, freshFamily, freshApts] =
            await Promise.all([
              fetchHealthProfile(supabase, user.id),
              fetchTimelineEvents(supabase, user.id),
              fetchHealthDocuments(supabase, user.id),
              fetchFamilyMembers(supabase, user.id),
              fetchAppointments(supabase, user.id),
            ]);

          setProfile(freshProfile ?? emptyLiveProfile(user));
          setTimeline(freshTimeline);
          setDocuments(freshDocuments);
          if (!freshFamily.error) setFamilyMembers(freshFamily.members);
          if (!freshApts.error) setAppointments(freshApts.appointments);
        }
      }

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

    async (

      updates: Partial<

        Pick<HealthProfile, "fullName" | "dateOfBirth" | "bloodType" | "allergies" | "chronicIllnesses">

      >

    ) => {

      const next = { ...profile, ...updates };

      setProfile(next);



      if (mode === "live" && userId && isSupabaseConfigured()) {

        const supabase = createClient();

        const { error } = await updateProfile(supabase, userId, updates);

        if (error) return { error: error.message };

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

        fileType: file.type,

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

    }) => {

      const localMed: Medication = {

        id: newLocalId(),

        ...med,

      };



      setProfile((prev) => ({

        ...prev,

        currentMedications: [...prev.currentMedications, localMed],

      }));



      if (mode === "live" && userId && isSupabaseConfigured()) {

        const supabase = createClient();

        const { data, error } = await dbAddMedication(supabase, userId, med);

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

          return { error: error.message };

        }

        if (member) {

          setFamilyMembers((prev) =>

            prev.map((m) => (m.id === local.id ? member : m))

          );

        }

      }



      return { error: null };

    },

    [mode, userId]

  );



  const downloadDocument = useCallback(

    async (doc: HealthDocument) => {

      if (doc.fileUrl.startsWith("blob:")) {

        const a = document.createElement("a");

        a.href = doc.fileUrl;

        a.download = doc.name;

        a.click();

        return { error: null };

      }



      if (mode === "live" && isSupabaseConfigured() && !doc.id.startsWith("local-")) {

        try {

          const res = await fetch(`/api/documents/${doc.id}/download`);

          const data = await res.json();

          if (!res.ok) return { error: data.error ?? "Download failed" };

          window.open(data.url, "_blank");

          return { error: null };

        } catch {

          return { error: "Download failed" };

        }

      }



      return { error: "Preview only for demo sample files" };

    },

    [mode]

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

    addEmergencyContact,

    removeEmergencyContact,

    uploadDocument,

    removeDocument,

    addMedication,

    removeMedication,

    addAppointment,

    removeAppointment,

    addFamilyMember,

    downloadDocument,

    exportHealthData,

    revokeShareLink,

    fetchShareLinks,

  };

}


