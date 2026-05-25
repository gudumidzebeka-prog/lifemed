import type { HealthProfile } from "@/types/health";
import { normalizeDateOfBirth } from "@/lib/health/profile-dates";

const PROFILE_CACHE_PREFIX = "lifemed-profile-v1";

export type CachedProfileFields = Pick<
  HealthProfile,
  | "fullName"
  | "dateOfBirth"
  | "email"
  | "phone"
  | "bloodType"
  | "allergies"
  | "chronicIllnesses"
  | "avatarUrl"
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
    dateOfBirth: normalizeDateOfBirth(profile.dateOfBirth),
    email: profile.email,
    phone: profile.phone,
    bloodType: profile.bloodType,
    allergies: profile.allergies,
    chronicIllnesses: profile.chronicIllnesses,
    avatarUrl: profile.avatarUrl,
  };

  localStorage.setItem(cacheKey(userId), JSON.stringify(payload));
}

export function mergeProfileWithCache(profile: HealthProfile, userId: string | null): HealthProfile {
  const cached = loadCachedProfileFields(userId);
  if (!cached) return profile;

  return {
    ...profile,
    fullName: profile.fullName.trim() ? profile.fullName : cached.fullName,
    dateOfBirth: normalizeDateOfBirth(profile.dateOfBirth) || normalizeDateOfBirth(cached.dateOfBirth),
    email: profile.email?.trim() ? profile.email : cached.email,
    phone: profile.phone?.trim() ? profile.phone : cached.phone,
    bloodType: profile.bloodType?.trim() ? profile.bloodType : cached.bloodType,
    allergies: profile.allergies.length > 0 ? profile.allergies : cached.allergies,
    chronicIllnesses:
      profile.chronicIllnesses.length > 0 ? profile.chronicIllnesses : cached.chronicIllnesses,
    avatarUrl: profile.avatarUrl ?? cached.avatarUrl,
  };
}
