import type { DataMode } from "@/hooks/use-health-data";
import type { Appointment, HealthDocument, HealthProfile, TimelineEvent } from "@/types/health";

export interface AIClientSnapshot {
  mode: DataMode;
  profile: HealthProfile;
  timeline: TimelineEvent[];
  documents: HealthDocument[];
  appointments: Appointment[];
}

export function buildClientHealthSnapshot(input: {
  mode: DataMode;
  profile: HealthProfile;
  timeline: TimelineEvent[];
  documents: HealthDocument[];
  appointments: Appointment[];
}): AIClientSnapshot {
  return {
    mode: input.mode,
    profile: input.profile,
    timeline: input.timeline,
    documents: input.documents.map((doc) => ({
      ...doc,
      fileUrl: doc.fileUrl?.startsWith("blob:") ? "[local-upload]" : doc.fileUrl,
    })),
    appointments: input.appointments,
  };
}
