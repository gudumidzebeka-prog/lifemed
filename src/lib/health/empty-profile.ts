import type { HealthProfile } from "@/types/health";

export const EMPTY_PROFILE: HealthProfile = {
  id: "",
  userId: "",
  fullName: "",
  dateOfBirth: "",
  allergies: [],
  chronicIllnesses: [],
  emergencyContacts: [],
  currentMedications: [],
};

export function emptyLiveProfile(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): HealthProfile {
  const metaName = user.user_metadata?.full_name;
  const fullName =
    typeof metaName === "string" && metaName.trim()
      ? metaName.trim()
      : user.email?.split("@")[0] ?? "User";

  return {
    id: user.id,
    userId: user.id,
    fullName,
    dateOfBirth: "",
    allergies: [],
    chronicIllnesses: [],
    emergencyContacts: [],
    currentMedications: [],
  };
}

export function displayFirstName(fullName: string, fallback = "User") {
  const trimmed = fullName.trim();
  if (!trimmed) return fallback;
  return trimmed.split(/\s+/)[0] ?? fallback;
}
