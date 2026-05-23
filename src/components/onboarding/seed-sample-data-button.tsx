"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers/locale-provider";
import { isDemoModeEnabled } from "@/lib/supabase/config";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

export function SeedSampleDataButton() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!isDemoModeEnabled()) return null;

  const handleSeed = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/seed", { method: "POST" });
      if (res.ok) {
        setDone(true);
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-lifemed-300 bg-lifemed-50/50 p-6 text-center dark:border-lifemed-700 dark:bg-lifemed-950/20">
      <Sparkles className="mx-auto h-8 w-8 text-lifemed-500" />
      <h3 className="mt-3 font-semibold text-foreground">{t("onboarding.seedTitle")}</h3>
      <p className="mt-1 text-sm text-muted">{t("onboarding.seedDesc")}</p>
      <Button className="mt-4" onClick={handleSeed} disabled={loading || done}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("onboarding.seedLoading")}
          </>
        ) : done ? (
          t("onboarding.seedDone")
        ) : (
          t("onboarding.seedButton")
        )}
      </Button>
    </div>
  );
}
