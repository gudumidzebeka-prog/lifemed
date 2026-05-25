"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Disclaimer } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslation } from "@/components/providers/locale-provider";
import { requestPasswordReset } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { APP_NAME } from "@/lib/constants";
import { Heart } from "lucide-react";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error: resetError, demo } = await requestPasswordReset(email);

    if (demo) {
      setError(t("auth.forgotPasswordDemoNote"));
      setLoading(false);
      return;
    }

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-soft items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-lifemed-500/20 mb-8">
            <Heart className="h-7 w-7 text-white" fill="white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">{t("auth.forgotPasswordTitle")}</h1>
          <p className="mt-4 text-muted leading-relaxed">{t("auth.forgotPasswordHero")}</p>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center p-6">
        <div className="absolute top-6 right-6">
          <LanguageSwitcher size="sm" />
        </div>
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <Heart className="h-5 w-5 text-white" fill="white" />
              </div>
              <span className="text-xl font-semibold">{APP_NAME}</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">{t("auth.forgotPasswordTitle")}</h2>
            <p className="mt-1 text-muted">{t("auth.forgotPasswordSubtitle")}</p>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-lifemed-200 bg-lifemed-50 px-4 py-3 text-sm text-lifemed-700 dark:border-lifemed-800 dark:bg-lifemed-950/30 dark:text-lifemed-300">
                {t("auth.forgotPasswordSuccess")}
              </div>
              <Button href="/login" variant="secondary" className="w-full">
                {t("auth.resetBackToLogin")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={t("auth.email")}
                type="email"
                autoComplete="email"
                placeholder={t("auth.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading || !isSupabaseConfigured()}>
                {loading ? t("auth.forgotPasswordLoading") : t("auth.forgotPasswordSubmit")}
              </Button>
            </form>
          )}

          {!success && (
            <p className="text-center text-sm text-muted">
              <Link href="/login" className="text-lifemed-600 font-medium hover:underline">
                {t("auth.resetBackToLogin")}
              </Link>
            </p>
          )}

          {!isSupabaseConfigured() && !success && (
            <p className="text-center text-xs text-muted">{t("auth.forgotPasswordDemoNote")}</p>
          )}

          <Disclaimer variant="privacy" />
        </div>
      </div>
    </div>
  );
}
