"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslation } from "@/components/providers/locale-provider";
import { getCurrentUser, resetPassword } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { APP_NAME } from "@/lib/constants";
import { Heart } from "lucide-react";

export default function ResetPasswordPage() {
  const { t } = useTranslation();

  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">{t("common.loading")}</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setCheckingSession(false);
      setSessionValid(false);
      return;
    }

    getCurrentUser()
      .then((user) => setSessionValid(Boolean(user)))
      .finally(() => setCheckingSession(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t("auth.passwordMinPlaceholder"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.resetPasswordMismatch"));
      return;
    }

    setLoading(true);

    const { error: resetError, demo } = await resetPassword(password);

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

    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-soft items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-lifemed-500/20 mb-8">
            <Heart className="h-7 w-7 text-white" fill="white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">{t("auth.resetPasswordTitle")}</h1>
          <p className="mt-4 text-muted leading-relaxed">{t("auth.resetPasswordHero")}</p>
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
            <h2 className="text-2xl font-bold text-foreground">{t("auth.resetPasswordTitle")}</h2>
            <p className="mt-1 text-muted">{t("auth.resetPasswordSubtitle")}</p>
          </div>

          {checkingSession ? (
            <p className="text-center text-muted">{t("common.loading")}</p>
          ) : !sessionValid ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                {t("auth.resetInvalidLink")}
              </div>
              <Button href="/forgot-password" className="w-full">
                {t("auth.forgotPasswordSubmit")}
              </Button>
              <p className="text-center text-sm text-muted">
                <Link href="/login" className="text-lifemed-600 font-medium hover:underline">
                  {t("auth.resetBackToLogin")}
                </Link>
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label={t("auth.resetPasswordNew")}
                  type="password"
                  autoComplete="new-password"
                  placeholder={t("auth.passwordMinPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <Input
                  label={t("auth.resetPasswordConfirm")}
                  type="password"
                  autoComplete="new-password"
                  placeholder={t("auth.passwordMinPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t("auth.resetPasswordLoading") : t("auth.resetPasswordSubmit")}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
