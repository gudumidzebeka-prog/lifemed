"use client";

import { cn } from "@/lib/utils";
import { LOCALES } from "@/lib/i18n";
import { useLocale } from "@/components/providers/locale-provider";
import type { Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  className?: string;
  size?: "sm" | "md";
}

export function LanguageSwitcher({ className, size = "md" }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-border bg-surface p-1",
        className
      )}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map(({ code, flag, label }) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code as Locale)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg font-medium transition-all",
              size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
              active
                ? "bg-lifemed-100 text-lifemed-700 shadow-sm dark:bg-lifemed-900/40 dark:text-lifemed-300"
                : "text-muted hover:bg-surface-elevated hover:text-foreground"
            )}
            aria-pressed={active}
            aria-label={label}
            title={label}
          >
            <span className="text-base leading-none" aria-hidden>
              {flag}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
