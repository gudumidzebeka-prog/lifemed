import { ka } from "./ka";
import { ru } from "./ru";
import { en } from "./en";
import type { Locale, TranslationTree } from "./types";

export const translations: Record<Locale, TranslationTree> = { ka, ru, en };

export function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`
  );
}

export function getTranslation(
  locale: Locale,
  path: string,
  params?: Record<string, string | number>
): string {
  const keys = path.split(".");
  let value: unknown = translations[locale];

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  if (typeof value !== "string") return path;
  return interpolate(value, params);
}

export type { Locale, TranslationTree } from "./types";
export { LOCALES, LOCALE_STORAGE_KEY, LOCALE_BCP47 } from "./types";
