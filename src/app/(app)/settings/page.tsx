"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { signOut } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { loadPreferences, savePreferences, type AppPreferences } from "@/lib/settings-prefs";
import { formatDate } from "@/lib/utils";
import type { ShareLink } from "@/types/health";
import {
  Shield,
  Lock,
  Bell,
  Fingerprint,
  Trash2,
  Download,
  LogOut,
  Link2,
} from "lucide-react";

export default function SettingsPage() {
  const { t, locale } = useTranslation();
  const { exportHealthData, fetchShareLinks, revokeShareLink } = useHealthDataContext();
  const [prefs, setPrefs] = useState<AppPreferences>(loadPreferences);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchShareLinks().then(setShareLinks);
  }, [fetchShareLinks]);

  const updatePref = (key: keyof AppPreferences, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    savePreferences(next);
  };

  const handleReminderToggle = async (
    key: "medicationReminders" | "appointmentReminders",
    value: boolean
  ) => {
    if (value && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "denied") {
        setMessage(t("settings.notificationsPermissionDenied"));
        return;
      }
      if (Notification.permission === "default") {
        const result = await Notification.requestPermission();
        if (result !== "granted") {
          setMessage(t("settings.notificationsPermissionDenied"));
          return;
        }
      }
    }

    updatePref(key, value);

    if (value && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        setMessage(t("settings.notificationsEnabled"));
        setTimeout(() => setMessage(null), 2000);
      }
    }
  };

  const handleRevoke = async (token: string) => {
    const { error } = await revokeShareLink(token);
    if (error) {
      setMessage(error);
      return;
    }
    setShareLinks((prev) => prev.filter((l) => l.token !== token));
    setMessage(t("settings.linkRevoked"));
    setTimeout(() => setMessage(null), 2000);
  };

  const handleExport = () => {
    exportHealthData();
    setMessage(t("settings.exportDone"));
    setTimeout(() => setMessage(null), 2000);
  };

  const handleDeleteDemo = async () => {
    if (!confirm(t("settings.clearConfirm"))) return;
    localStorage.removeItem("lifemed-appointments");
    localStorage.removeItem("lifemed-preferences");
    try {
      await fetch("/api/demo/clear", { method: "POST" });
    } catch {
      /* demo share cleanup is best-effort */
    }
    setMessage(t("settings.clearDone"));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("settings.title")}</h1>
        <p className="mt-1 text-muted">{t("settings.subtitle")}</p>
      </div>

      {message && <p className="text-sm text-lifemed-600 dark:text-lifemed-400">{message}</p>}

      <Disclaimer variant="privacy" />

      <div className="space-y-4">
        <SettingsSection title={t("settings.appearance")}>
          <SettingsRow
            icon={<div className="h-5 w-5" />}
            label={t("settings.theme")}
            description={t("settings.themeDesc")}
            action={<ThemeToggle />}
          />
        </SettingsSection>

        <SettingsSection title={t("settings.security")}>
          <SettingsRow
            icon={<Fingerprint className="h-5 w-5 text-lifemed-500" />}
            label={t("settings.biometric")}
            description={t("settings.biometricDesc")}
            action={
              <ToggleSwitch
                checked={prefs.biometricLogin}
                onChange={(v) => updatePref("biometricLogin", v)}
              />
            }
          />
          <SettingsRow
            icon={<Lock className="h-5 w-5 text-lifemed-500" />}
            label={t("settings.encryption")}
            description={t("settings.encryptionDesc")}
            action={
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {t("settings.encryptionActive")}
              </span>
            }
          />
          <SettingsRow
            icon={<Shield className="h-5 w-5 text-lifemed-500" />}
            label={t("settings.twoFactor")}
            description={t("settings.twoFactorDesc")}
            action={
              <Button variant="secondary" size="sm" disabled>
                {t("settings.comingSoon")}
              </Button>
            }
          />
        </SettingsSection>

        <SettingsSection title={t("settings.notifications")}>
          <SettingsRow
            icon={<Bell className="h-5 w-5 text-lifemed-500" />}
            label={t("settings.medicationReminders")}
            description={t("settings.medicationRemindersDesc")}
            action={
              <ToggleSwitch
                checked={prefs.medicationReminders}
                onChange={(v) => handleReminderToggle("medicationReminders", v)}
              />
            }
          />
          <SettingsRow
            icon={<Bell className="h-5 w-5 text-lifemed-500" />}
            label={t("settings.appointmentReminders")}
            description={t("settings.appointmentRemindersDesc")}
            action={
              <ToggleSwitch
                checked={prefs.appointmentReminders}
                onChange={(v) => handleReminderToggle("appointmentReminders", v)}
              />
            }
          />
        </SettingsSection>

        <SettingsSection title={t("settings.setupGuide")}>
          <SettingsRow
            icon={<Link2 className="h-5 w-5 text-lifemed-500" />}
            label={t("settings.setupGuide")}
            description={t("settings.setupGuideDesc")}
            action={
              <Button variant="secondary" size="sm" href="/setup">
                {t("settings.openSetup")}
              </Button>
            }
          />
        </SettingsSection>

        <SettingsSection title={t("settings.activeShareLinks")}>
          {shareLinks.length === 0 ? (
            <p className="py-4 text-sm text-muted">{t("settings.noShareLinks")}</p>
          ) : (
            shareLinks.map((link) => (
              <div
                key={link.token}
                className="flex items-center justify-between gap-4 py-4 border-b border-border last:border-0"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <Link2 className="h-5 w-5 text-lifemed-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{link.token.slice(0, 12)}...</p>
                    <p className="text-xs text-muted">
                      {t("common.expires", { date: formatDate(link.expiresAt, locale) })}
                    </p>
                  </div>
                </div>
                <Button variant="danger" size="sm" onClick={() => handleRevoke(link.token)}>
                  {t("common.revoke")}
                </Button>
              </div>
            ))
          )}
        </SettingsSection>

        <SettingsSection title={t("settings.exportData")}>
          <SettingsRow
            icon={<Download className="h-5 w-5 text-lifemed-500" />}
            label={t("settings.exportData")}
            description={t("settings.exportDataDesc")}
            action={
              <Button variant="secondary" size="sm" onClick={handleExport}>
                {t("common.export")}
              </Button>
            }
          />
          <SettingsRow
            icon={<Trash2 className="h-5 w-5 text-rose-500" />}
            label={t("settings.clearLocal")}
            description={t("settings.clearLocalDesc")}
            action={
              <Button variant="danger" size="sm" onClick={handleDeleteDemo}>
                {t("common.clear")}
              </Button>
            }
          />
        </SettingsSection>
      </div>

      <div className="space-y-3 pt-2">
        <Button variant="danger" className="w-full" size="lg" onClick={() => signOut()}>
          <LogOut className="h-4 w-4" />
          {t("settings.signOutSite")}
        </Button>

        {isSupabaseConfigured() && (
          <p className="text-center text-xs text-muted">{t("settings.signOutNote")}</p>
        )}
      </div>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border p-0 px-6 pb-2">{children}</CardContent>
    </Card>
  );
}

function SettingsRow({
  icon,
  label,
  description,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted mt-0.5">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
        checked ? "bg-lifemed-500" : "bg-border"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
