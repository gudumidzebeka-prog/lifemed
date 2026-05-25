"use client";

import { useCallback, useEffect, useState } from "react";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import {
  findActiveMedicalShareLink,
  loadCachedMedicalShare,
  MEDICAL_SHARE_EXPIRY_HOURS,
  MEDICAL_SHARE_SCOPES,
  saveCachedMedicalShare,
} from "@/lib/health/medical-share-qr";
import type { ShareLink } from "@/types/health";

export function useMedicalShareQr() {
  const { userId, loading: profileLoading } = useHealthDataContext();
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cached = loadCachedMedicalShare(userId);
      if (cached) {
        setUrl(cached.url);
        return;
      }

      const listRes = await fetch("/api/share", { credentials: "same-origin" });
      if (!listRes.ok) {
        throw new Error("Failed to load share links");
      }

      const listData = (await listRes.json()) as { links?: ShareLink[] };
      const existing = findActiveMedicalShareLink(listData.links ?? []);

      if (existing) {
        const shareUrl = `${window.location.origin}/share/${existing.token}`;
        saveCachedMedicalShare(userId, {
          url: shareUrl,
          token: existing.token,
          expiresAt: existing.expiresAt,
        });
        setUrl(shareUrl);
        return;
      }

      const createRes = await fetch("/api/share", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scopes: [...MEDICAL_SHARE_SCOPES],
          expiryHours: MEDICAL_SHARE_EXPIRY_HOURS,
        }),
      });

      const createData = (await createRes.json()) as {
        url?: string;
        token?: string;
        expiresAt?: string;
        error?: string;
      };

      if (!createRes.ok || !createData.url || !createData.token || !createData.expiresAt) {
        throw new Error(createData.error ?? "Failed to create share link");
      }

      saveCachedMedicalShare(userId, {
        url: createData.url,
        token: createData.token,
        expiresAt: createData.expiresAt,
      });
      setUrl(createData.url);
    } catch (err) {
      setUrl(null);
      setError(err instanceof Error ? err.message : "Failed to prepare QR code");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (profileLoading) return;
    void refresh();
  }, [profileLoading, refresh]);

  return { url, loading, error, refresh };
}
