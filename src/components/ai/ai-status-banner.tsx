"use client";

import { AlertTriangle, Info } from "lucide-react";
import { useTranslation } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

export function AiStatusBanner({
  aiConfigured,
  hint,
  className,
}: {
  aiConfigured: boolean | null;
  hint?: string | null;
  className?: string;
}) {
  const { t } = useTranslation();

  if (aiConfigured === null) return null;

  const text = aiConfigured
    ? t("disclaimers.medical")
    : hint?.trim() || t("ai.demoModeNote");

  const Icon = aiConfigured ? AlertTriangle : Info;
  const styles = aiConfigured
    ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100"
    : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100";

  return (
    <div className={cn("flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs leading-relaxed", styles, className)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", aiConfigured ? "text-amber-600" : "text-blue-600")} />
      <p>{text}</p>
    </div>
  );
}
