import type { SupabaseClient } from "@supabase/supabase-js";
import type { HealthProfile } from "@/types/health";
import { isProfileGender, type ProfileGender } from "@/lib/health/profile-gender";
import { updateProfile } from "@/lib/health/db";

const PROFILE_EMAIL_METADATA_KEY = "profile_email";

export type ProfilePersistSlice = Partial<
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

export function readAuthContactEmail(user: { email?: string; user_metadata?: Record<string, unknown> }) {
  const metadataEmail = user.user_metadata?.[PROFILE_EMAIL_METADATA_KEY];
  if (typeof metadataEmail === "string" && metadataEmail.trim()) {
    return metadataEmail.trim();
  }
  return user.email;
}

export function readAuthContactPhone(user: { user_metadata?: Record<string, unknown> }) {
  const metaPhone = user.user_metadata?.phone;
  return typeof metaPhone === "string" && metaPhone.trim() ? metaPhone.trim() : undefined;
}

export function readAuthCity(user: { user_metadata?: Record<string, unknown> }) {
  const metaCity = user.user_metadata?.city;
  return typeof metaCity === "string" && metaCity.trim() ? metaCity.trim() : undefined;
}

export function readAuthGender(user: { user_metadata?: Record<string, unknown> }) {
  const metaGender = user.user_metadata?.gender;
  return typeof metaGender === "string" && isProfileGender(metaGender) ? metaGender : undefined;
}

export function withAuthContact(
  profile: HealthProfile,
  user: { email?: string; user_metadata?: Record<string, unknown> }
): HealthProfile {
  const metadataPhone = readAuthContactPhone(user);
  const metadataEmail = readAuthContactEmail(user);
  const metadataCity = readAuthCity(user);
  const metadataGender = readAuthGender(user);

  return {
    ...profile,
    email: profile.email?.trim() || metadataEmail || undefined,
    phone: profile.phone?.trim() || metadataPhone || undefined,
    city: profile.city?.trim() || metadataCity || undefined,
    gender: profile.gender || metadataGender || undefined,
  };
}

export async function syncProfileContactToAuth(
  supabase: SupabaseClient,
  contact: { phone?: string; email?: string }
) {
  const data: Record<string, string> = {};

  if (contact.phone !== undefined) {
    data.phone = contact.phone.trim();
  }
  if (contact.email !== undefined) {
    data[PROFILE_EMAIL_METADATA_KEY] = contact.email.trim();
  }

  if (Object.keys(data).length === 0) {
    return { error: null };
  }

  const { error } = await supabase.auth.updateUser({ data });
  return { error };
}

export async function syncProfileLocationToAuth(
  supabase: SupabaseClient,
  location: { city?: string; gender?: ProfileGender | "" }
) {
  const data: Record<string, string> = {};

  if (location.city !== undefined) {
    data.city = location.city.trim();
  }
  if (location.gender !== undefined) {
    data.gender = location.gender || "";
  }

  if (Object.keys(data).length === 0) {
    return { error: null };
  }

  const { error } = await supabase.auth.updateUser({ data });
  return { error };
}

function isMissingOptionalColumnError(
  error: { message?: string; code?: string } | null,
  patch: ProfilePersistSlice
) {
  if (!error) return false;

  const message = (error.message ?? "").toLowerCase();
  if (error.code === "PGRST204") return true;

  if (patch.email !== undefined && message.includes("email")) return true;
  if (patch.phone !== undefined && message.includes("phone")) return true;
  if (patch.city !== undefined && message.includes("city")) return true;
  if (patch.gender !== undefined && message.includes("gender")) return true;

  return message.includes("could not find the") && message.includes("column");
}

export function isMissingProfileColumnError(error: { message?: string; code?: string } | null) {
  if (!error) return false;

  const message = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST204" ||
    message.includes("could not find the") ||
    message.includes("column")
  );
}

export async function persistProfileUpdates(
  supabase: SupabaseClient,
  userId: string,
  updates: ProfilePersistSlice
) {
  const { city, gender, email, phone, ...core } = updates;

  if (email !== undefined || phone !== undefined) {
    const contactResult = await syncProfileContactToAuth(supabase, { email, phone });
    if (contactResult.error) {
      return contactResult;
    }
  }

  if (city !== undefined || gender !== undefined) {
    const locationResult = await syncProfileLocationToAuth(supabase, { city, gender });
    if (locationResult.error) {
      return locationResult;
    }
  }

  if (Object.keys(core).length > 0) {
    const { error } = await updateProfile(supabase, userId, core);
    if (error) {
      return { error };
    }
  }

  const optionalPatches: ProfilePersistSlice[] = [];
  if (email !== undefined || phone !== undefined) {
    optionalPatches.push({ email, phone });
  }
  if (city !== undefined || gender !== undefined) {
    optionalPatches.push({ city, gender });
  }

  for (const patch of optionalPatches) {
    const { error } = await updateProfile(supabase, userId, patch);
    if (error && !isMissingOptionalColumnError(error, patch)) {
      return { error };
    }
  }

  return { error: null };
}
