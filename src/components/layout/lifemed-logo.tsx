"use client";

import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { useTranslation } from "@/components/providers/locale-provider";

const HOME_PATH = "/dashboard";

type LifeMedLogoProps = {
  variant?: "compact" | "sidebar";
  className?: string;
};

export function LifeMedLogo({ variant = "compact", className }: LifeMedLogoProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isCompact = variant === "compact";
  const onHome = pathname === HOME_PATH;

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (onHome) {
      window.location.reload();
      return;
    }

    window.location.assign(HOME_PATH);
  };

  return (
    <a
      href={HOME_PATH}
      onClick={handleClick}
      aria-label={t("common.refreshPage")}
      title={t("common.refreshPage")}
      className={cn(
        "lifemed-logo-link relative z-50 flex cursor-pointer items-center gap-2 rounded-xl no-underline transition-transform hover:opacity-90 active:scale-[0.98]",
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center gradient-primary shadow-md shadow-lifemed-500/20",
          isCompact ? "h-8 w-8 rounded-lg" : "h-10 w-10 rounded-xl"
        )}
      >
        <Heart className={cn(isCompact ? "h-4 w-4" : "h-5 w-5", "text-white")} fill="white" />
      </div>
      {isCompact ? (
        <span className="font-semibold text-foreground">{APP_NAME}</span>
      ) : (
        <div>
          <p className="font-semibold text-foreground">{APP_NAME}</p>
          <p className="text-xs text-muted">{t("nav.sidebarTagline")}</p>
        </div>
      )}
    </a>
  );
}
