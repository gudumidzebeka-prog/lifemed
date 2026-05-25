import type { HealthProfile } from "@/types/health";

export function withAuthContact(
  profile: HealthProfile,
  user: { email?: string; user_metadata?: Record<string, unknown> }
): HealthProfile {
  const metaPhone = user.user_metadata?.phone;
  const metadataPhone = typeof metaPhone === "string" ? metaPhone.trim() : "";

  return {
    ...profile,
    email: profile.email?.trim() || user.email || undefined,
    phone: profile.phone?.trim() || metadataPhone || undefined,
  };
}
