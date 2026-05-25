"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";

export function LiveModeBadge() {
  const { t } = useTranslation();
  const { mode } = useHealthDataContext();

  if (mode !== "live") return null;

  return (
    <Badge
      variant="success"
      className="px-2 py-0 text-[10px] font-semibold uppercase tracking-wide"
    >
      {t("common.live")}
    </Badge>
  );
}
