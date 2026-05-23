"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers/locale-provider";
import { Settings, ArrowRight } from "lucide-react";

export function SetupBanner() {
  const { t } = useTranslation();
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    fetch("/api/setup/status")
      .then((r) => r.json())
      .then((data) => setNeedsSetup(!data.supabase))
      .catch(() => setNeedsSetup(true));
  }, []);

  if (!needsSetup) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-800 dark:bg-amber-950/30">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-amber-900 dark:text-amber-100">
            {t("onboarding.setupBannerTitle")}
          </p>
          <p className="text-sm text-amber-800/80 dark:text-amber-200/80 mt-0.5">
            {t("onboarding.setupBannerDesc")}
          </p>
        </div>
        <Link href="/setup">
          <Button variant="secondary" size="sm">
            <Settings className="h-4 w-4" />
            {t("onboarding.setupBannerCta")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
