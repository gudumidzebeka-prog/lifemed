import type { SupabaseClient } from "@supabase/supabase-js";
import type { HealthProfile } from "@/types/health";

const PROFILE_EMAIL_METADATA_KEY = "profile_email";

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

export function withAuthContact(
  profile: HealthProfile,
  user: { email?: string; user_metadata?: Record<string, unknown> }
): HealthProfile {
  const metadataPhone = readAuthContactPhone(user);
  const metadataEmail = readAuthContactEmail(user);

  return {
    ...profile,
    email: profile.email?.trim() || metadataEmail || undefined,
    phone: profile.phone?.trim() || metadataPhone || undefined,
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

export function isMissingProfileColumnError(error: { message?: string; code?: string } | null) {
  if (!error) return false;

  const message = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST204" ||
    message.includes("could not find the") ||
    message.includes("column") ||
    message.includes("phone") ||
    message.includes("email")
  );
}
