"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/components/providers/locale-provider";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Sparkles, Database } from "lucide-react";

export function DataModeBanner({ mode }: { mode: "demo" | "live" }) {
  const { t } = useTranslation();

  if (mode === "live") {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-lifemed-200 bg-lifemed-50 p-4 dark:border-lifemed-800 dark:bg-lifemed-950/30">
        <Database className="mt-0.5 h-4 w-4 shrink-0 text-lifemed-600 dark:text-lifemed-400" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">{t("dataMode.liveTitle")}</p>
            <Badge variant="success">{t("common.live")}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted leading-relaxed">{t("dataMode.liveDesc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{t("dataMode.demoTitle")}</p>
          <Badge variant="warning">{t("common.demo")}</Badge>
        </div>
        <p className="mt-1 text-xs text-muted leading-relaxed">
          {isSupabaseConfigured()
            ? t("dataMode.demoDescConfigured")
            : t("dataMode.demoDescNotConfigured")}
        </p>
      </div>
    </div>
  );
}
