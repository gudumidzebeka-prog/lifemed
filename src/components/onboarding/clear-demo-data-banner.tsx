"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { clearDemoSeedFromAccount, isDemoSeedProfile } from "@/lib/health/demo-seed";
import { AlertTriangle } from "lucide-react";

export function ClearDemoDataBanner() {
  const { t } = useTranslation();
  const { mode, profile, reload } = useHealthDataContext();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (done || mode !== "live" || !isDemoSeedProfile(profile)) {
    return null;
  }

  const handleClear = async () => {
    setLoading(true);
    try {
      const cleared = await clearDemoSeedFromAccount();
      if (cleared) {
        setDone(true);
        await reload();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="text-sm font-medium text-foreground">{t("dataMode.clearDemoTitle")}</p>
          <p className="mt-1 text-xs text-muted leading-relaxed">{t("dataMode.clearDemoDesc")}</p>
        </div>
      </div>
      <Button variant="secondary" size="sm" onClick={handleClear} disabled={loading} className="shrink-0">
        {loading ? t("common.loading") : t("dataMode.clearDemoAction")}
      </Button>
    </div>
  );
}
