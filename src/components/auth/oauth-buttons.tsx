"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers/locale-provider";
import { signInWithOAuth } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useState } from "react";

interface OAuthButtonsProps {
  mode: "login" | "signup";
}

export function OAuthButtons({ mode }: OAuthButtonsProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<string | null>(null);

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoading(provider);
    try {
      if (!isSupabaseConfigured()) {
        window.location.href = "/dashboard";
        return;
      }
      await signInWithOAuth(provider);
    } catch {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        variant="secondary"
        type="button"
        disabled={loading !== null}
        onClick={() => handleOAuth("google")}
      >
        {loading === "google" ? "..." : t("auth.oauthGoogle")}
      </Button>
      <Button
        variant="secondary"
        type="button"
        disabled={loading !== null}
        onClick={() => handleOAuth("apple")}
      >
        {loading === "apple" ? "..." : t("auth.oauthApple")}
      </Button>
      {!isSupabaseConfigured() && (
        <p className="col-span-2 text-center text-xs text-muted">
          {mode === "login"
            ? t("auth.oauthNotConfiguredLogin")
            : t("auth.oauthNotConfiguredSignup")}
        </p>
      )}
    </div>
  );
}
