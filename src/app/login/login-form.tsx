"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Disclaimer } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslation } from "@/components/providers/locale-provider";
import { signInWithEmail } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { APP_NAME } from "@/lib/constants";
import { safeRedirectPath } from "@/lib/utils";
import { Heart } from "lucide-react";

export function LoginForm() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const next = safeRedirectPath(searchParams.get("next"));
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    authError ? t("auth.authFailed") : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError, demo } = await signInWithEmail(email, password);

    if (demo) {
      window.location.href = next;
      return;
    }

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    window.location.href = next;
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-soft items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-lifemed-500/20 mb-8">
            <Heart className="h-7 w-7 text-white" fill="white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("auth.welcomeBack", { appName: APP_NAME })}
          </h1>
          <p className="mt-4 text-muted leading-relaxed">{t("auth.loginHero")}</p>
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
            <h2 className="text-2xl font-bold text-foreground">{t("auth.signIn")}</h2>
            <p className="mt-1 text-muted">{t("auth.signInSubtitle")}</p>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t("auth.email")}
              type="text"
              inputMode="email"
              autoComplete="email"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label={t("auth.password")}
              type="password"
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("auth.signInLoading") : t("auth.signIn")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted">
            {t("auth.noAccount")}{" "}
            <Link href="/signup" className="text-lifemed-600 font-medium hover:underline">
              {t("auth.signUpLink")}
            </Link>
          </p>

          {!isSupabaseConfigured() && (
            <p className="text-center text-xs text-muted">{t("auth.demoLoginNote")}</p>
          )}

          <Disclaimer variant="privacy" />
        </div>
      </div>
    </div>
  );
}
