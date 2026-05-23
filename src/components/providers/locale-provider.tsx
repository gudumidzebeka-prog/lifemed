"use client";



import {

  createContext,

  useCallback,

  useContext,

  useEffect,

  useMemo,

  useState,

} from "react";

import {

  getTranslation,

  LOCALE_BCP47,

  LOCALE_STORAGE_KEY,

  type Locale,

  type TranslationTree,

  translations,

} from "@/lib/i18n";



type TranslateFn = (path: string, params?: Record<string, string | number>) => string;



interface LocaleContextValue {

  locale: Locale;

  setLocale: (locale: Locale) => void;

  t: TranslateFn;

  dict: TranslationTree;

}



const LocaleContext = createContext<LocaleContextValue | null>(null);



function readStoredLocale(): Locale {

  if (typeof window === "undefined") return "ka";

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);

  if (stored === "ka" || stored === "ru" || stored === "en") return stored;

  return "ka";

}



function persistLocale(locale: Locale) {

  if (typeof window === "undefined") return;

  document.documentElement.lang = LOCALE_BCP47[locale];

  localStorage.setItem(LOCALE_STORAGE_KEY, locale);

  document.cookie = `${LOCALE_STORAGE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`;

}



export function LocaleProvider({

  children,

  initialLocale = "ka",

}: {

  children: React.ReactNode;

  initialLocale?: Locale;

}) {

  const [locale, setLocaleState] = useState<Locale>(initialLocale);



  useEffect(() => {

    const stored = readStoredLocale();

    if (stored !== initialLocale) {

      setLocaleState(stored);

      persistLocale(stored);

      return;

    }

    persistLocale(initialLocale);

  }, [initialLocale]);



  const setLocale = useCallback((next: Locale) => {

    setLocaleState(next);

    persistLocale(next);

  }, []);



  const dict = translations[locale];



  const t = useCallback<TranslateFn>(

    (path, params) => getTranslation(locale, path, params),

    [locale]

  );



  const value = useMemo(

    () => ({ locale, setLocale, t, dict }),

    [locale, setLocale, t, dict]

  );



  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;

}



export function useLocale() {

  const ctx = useContext(LocaleContext);

  if (!ctx) {

    throw new Error("useLocale must be used within LocaleProvider");

  }

  return ctx;

}



export function useTranslation() {

  const { t, locale, dict, setLocale } = useLocale();

  return { t, locale, dict, setLocale };

}



export type TFunction = TranslateFn;


