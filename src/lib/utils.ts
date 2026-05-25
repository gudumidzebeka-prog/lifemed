import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/lib/i18n";
import { getTranslation, LOCALE_BCP47 } from "@/lib/i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: string | Date,
  locale: Locale = "ka",
  options?: Intl.DateTimeFormatOptions
) {
  return new Intl.DateTimeFormat(LOCALE_BCP47[locale], {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function formatRelativeTime(date: string | Date, locale: Locale = "ka") {
  const now = new Date();
  const target = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return getTranslation(locale, "common.today");
  if (diffDays === 1) return getTranslation(locale, "common.yesterday");
  if (diffDays < 7) return getTranslation(locale, "common.daysAgo", { count: diffDays });
  if (diffDays < 30) {
    return getTranslation(locale, "common.weeksAgo", { count: Math.floor(diffDays / 7) });
  }
  return formatDate(target, locale);
}

export function generateShareToken(length = 32) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/** Allow only same-origin relative paths in auth redirects. */
export function safeRedirectPath(next: string | null | undefined, fallback = "/dashboard") {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback;
  }
  return next;
}
