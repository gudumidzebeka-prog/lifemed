import type { ShareLink } from "@/types/health";

export const MEDICAL_SHARE_SCOPES = ["profile", "emergency"] as const;
export const MEDICAL_SHARE_EXPIRY_HOURS = 24 * 30;
export const MEDICAL_SHARE_CACHE_PREFIX = "lifemed-medical-qr-v1";

export interface CachedMedicalShare {
  url: string;
  token: string;
  expiresAt: string;
}

export function medicalShareCacheKey(userId: string | null) {
  return `${MEDICAL_SHARE_CACHE_PREFIX}:${userId ?? "demo"}`;
}

export function loadCachedMedicalShare(userId: string | null): CachedMedicalShare | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(medicalShareCacheKey(userId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedMedicalShare;
    if (!parsed.url || !parsed.expiresAt) return null;
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function saveCachedMedicalShare(userId: string | null, entry: CachedMedicalShare) {
  if (typeof window === "undefined") return;
  localStorage.setItem(medicalShareCacheKey(userId), JSON.stringify(entry));
}

export function isMedicalShareLink(link: ShareLink) {
  const scopes = link.permissions.map((permission) => permission.scope);
  return MEDICAL_SHARE_SCOPES.every((scope) => scopes.includes(scope));
}

export function findActiveMedicalShareLink(links: ShareLink[]) {
  const now = Date.now();

  return links.find((link) => {
    if (!isMedicalShareLink(link)) return false;
    return new Date(link.expiresAt).getTime() > now;
  });
}
