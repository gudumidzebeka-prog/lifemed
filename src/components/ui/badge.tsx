"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/components/providers/locale-provider";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-lifemed-100 text-lifemed-700 dark:bg-lifemed-900/40 dark:text-lifemed-300":
            variant === "default",
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300":
            variant === "success",
          "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300":
            variant === "warning",
          "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300":
            variant === "danger",
          "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300":
            variant === "info",
        },
        className
      )}
    >
      {children}
    </span>
  );
}

interface DisclaimerProps {
  variant?: "medical" | "privacy" | "info";
  className?: string;
}

export function Disclaimer({ variant = "medical", className }: DisclaimerProps) {
  const { t } = useTranslation();

  const config = {
    medical: {
      icon: AlertTriangle,
      text: t("disclaimers.medical"),
      bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    privacy: {
      icon: ShieldCheck,
      text: t("disclaimers.privacy"),
      bg: "bg-lifemed-50 dark:bg-lifemed-950/20 border-lifemed-200 dark:border-lifemed-800",
      iconColor: "text-lifemed-600 dark:text-lifemed-400",
    },
    info: {
      icon: Info,
      text: t("disclaimers.info"),
      bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
  };

  const { icon: Icon, text, bg, iconColor } = config[variant];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4 text-sm",
        bg,
        className
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconColor)} />
      <p className="text-muted leading-relaxed">{text}</p>
    </div>
  );
}
