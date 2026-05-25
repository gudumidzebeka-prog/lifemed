"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { useTranslation } from "@/components/providers/locale-provider";

type LifeMedLogoProps = {
  variant?: "compact" | "sidebar";
  className?: string;
};

export function LifeMedLogo({ variant = "compact", className }: LifeMedLogoProps) {
  const { t } = useTranslation();
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = () => {
    if (spinning) return;
    setSpinning(true);
    window.location.reload();
  };

  const isCompact = variant === "compact";

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={spinning}
      aria-label={t("common.refreshPage")}
      title={t("common.refreshPage")}
      className={cn(
        "relative z-10 flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-transparent p-0 text-left transition-transform hover:opacity-90 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70",
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center gradient-primary shadow-md shadow-lifemed-500/20",
          isCompact ? "h-8 w-8 rounded-lg" : "h-10 w-10 rounded-xl",
          spinning && "animate-spin"
        )}
      >
        <Heart className={cn(isCompact ? "h-4 w-4" : "h-5 w-5", "text-white")} fill="white" />
      </div>
      {isCompact ? (
        <span className="font-semibold text-foreground">{APP_NAME}</span>
      ) : (
        <div>
          <h1 className="font-semibold text-foreground">{APP_NAME}</h1>
          <p className="text-xs text-muted">{t("nav.sidebarTagline")}</p>
        </div>
      )}
    </button>
  );
}
