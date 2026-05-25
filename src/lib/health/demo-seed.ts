import type { HealthProfile } from "@/types/health";

export const DEMO_PROFILE_NAME = "Sarah Chen";

export const DEMO_TIMELINE_TITLES = [
  "Annual Physical Exam",
  "COVID-19 Vaccination (Booster)",
  "Lupus Flare — Rheumatology Visit",
  "Appendectomy",
];

export function isDemoSeedProfile(profile: Pick<HealthProfile, "fullName">) {
  return profile.fullName.trim() === DEMO_PROFILE_NAME;
}

export async function clearDemoSeedFromAccount() {
  const res = await fetch("/api/onboarding/clear-demo", {
    method: "POST",
    credentials: "same-origin",
  });

  if (!res.ok) return false;

  const data = (await res.json()) as { cleared?: boolean };
  return Boolean(data.cleared);
}
