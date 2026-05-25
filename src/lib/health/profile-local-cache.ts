import type { HealthProfile } from "@/types/health";

const PROFILE_CACHE_PREFIX = "lifemed-profile-v1";

export type CachedProfileFields = Pick<
  HealthProfile,
  "fullName" | "dateOfBirth" | "bloodType" | "allergies" | "chronicIllnesses"
>;

function cacheKey(userId: string | null) {
  return userId ? `${PROFILE_CACHE_PREFIX}:${userId}` : `${PROFILE_CACHE_PREFIX}:demo`;
}

export function loadCachedProfileFields(userId: string | null): CachedProfileFields | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(cacheKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as CachedProfileFields;
  } catch {
    return null;
  }
}

export function saveCachedProfileFields(userId: string | null, profile: HealthProfile) {
  if (typeof window === "undefined") return;

  const payload: CachedProfileFields = {
    fullName: profile.fullName,
    dateOfBirth: profile.dateOfBirth,
    bloodType: profile.bloodType,
    allergies: profile.allergies,
    chronicIllnesses: profile.chronicIllnesses,
  };

  localStorage.setItem(cacheKey(userId), JSON.stringify(payload));
}

export function mergeProfileWithCache(profile: HealthProfile, userId: string | null): HealthProfile {
  const cached = loadCachedProfileFields(userId);
  if (!cached) return profile;

  return {
    ...profile,
    fullName: profile.fullName.trim() ? profile.fullName : cached.fullName,
    dateOfBirth: profile.dateOfBirth || cached.dateOfBirth,
    bloodType: profile.bloodType ?? cached.bloodType,
    allergies: profile.allergies.length > 0 ? profile.allergies : cached.allergies,
    chronicIllnesses:
      profile.chronicIllnesses.length > 0 ? profile.chronicIllnesses : cached.chronicIllnesses,
  };
}
