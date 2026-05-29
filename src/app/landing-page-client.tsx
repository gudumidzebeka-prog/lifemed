"use client";

import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslation } from "@/components/providers/locale-provider";
import { APP_NAME } from "@/lib/constants";
import {
  Heart,
  Shield,
  Clock,
  Sparkles,
  Share2,
  ArrowRight,
  Lock,
} from "lucide-react";

export function LandingPageClient() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Clock,
      title: t("landing.featureTimelineTitle"),
      desc: t("landing.featureTimelineDesc"),
    },
    {
      icon: Shield,
      title: t("landing.featureSecureTitle"),
      desc: t("landing.featureSecureDesc"),
    },
    {
      icon: Sparkles,
      title: t("landing.featureAiTitle"),
      desc: t("landing.featureAiDesc"),
    },
    {
      icon: Share2,
      title: t("landing.featureShareTitle"),
      desc: t("landing.featureShareDesc"),
    },
    {
      icon: Heart,
      title: t("landing.featureEmergencyTitle"),
      desc: t("landing.featureEmergencyDesc"),
    },
    {
      icon: Lock,
      title: t("landing.featureVaultTitle"),
      desc: t("landing.featureVaultDesc"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-soft opacity-60" />
        <div className="relative mx-auto max-w-6xl px-4 py-6 lg:px-8">
          <nav className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-lifemed-500/20">
                <Heart className="h-5 w-5 text-white" fill="white" />
              </div>
              <span className="text-xl font-semibold">{APP_NAME}</span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <LanguageSwitcher />
              <Button variant="ghost" href="/login">
                {t("landing.signIn")}
              </Button>
              <Button href="/signup">{t("landing.getStarted")}</Button>
            </div>
          </nav>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 text-center lg:px-8 lg:pt-24">
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-lifemed-200 bg-lifemed-50 px-4 py-1.5 text-sm text-lifemed-700 dark:border-lifemed-800 dark:bg-lifemed-950/30 dark:text-lifemed-300">
              <Lock className="h-3.5 w-3.5" />
              {t("landing.badge")}
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              {t("landing.title")}{" "}
              <span className="text-lifemed-600 dark:text-lifemed-400">
                {t("landing.titleHighlight")}
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted leading-relaxed text-balance">
              {t("landing.subtitle")}
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="min-w-[200px]" href="/signup">
                {t("landing.ctaPrimary")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-foreground">
          {t("landing.featuresTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted">
          {t("landing.featuresSubtitle")}
        </p>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-lifemed-50 text-lifemed-600 dark:bg-lifemed-950/50 dark:text-lifemed-400">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface-elevated">
        <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
          <Disclaimer variant="privacy" />
          <p className="mt-4 text-center text-sm text-muted">{t("disclaimers.privacyMessage")}</p>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted lg:px-8">
          <p>
            {t("landing.footer", {
              year: new Date().getFullYear(),
              appName: APP_NAME,
            })}
          </p>
          <Disclaimer variant="medical" className="mt-6 text-left" />
        </div>
      </footer>
    </div>
  );
}
