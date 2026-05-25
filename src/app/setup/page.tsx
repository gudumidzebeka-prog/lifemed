"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APP_NAME } from "@/lib/constants";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslation } from "@/components/providers/locale-provider";
import {
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  Heart,
  Database,
  Key,
  Server,
  UserPlus,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface SetupStatus {
  supabase: boolean;
  serviceRole: boolean;
  openai: boolean;
  appUrl: string;
  redirectUrl: string;
}

const envTemplate = `# Supabase (https://supabase.com → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI — Groq recommended (free: console.groq.com)
GROQ_API_KEY=your-groq-api-key
# GEMINI_API_KEY=your-gemini-api-key
# OPENAI_API_KEY=your-openai-api-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000`;

export default function SetupPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [copied, setCopied] = useState(false);
  const [localSteps, setLocalSteps] = useState({
    node: true,
    npm: true,
    envFile: false,
    schema: false,
    restart: false,
    account: false,
  });

  useEffect(() => {
    fetch("/api/setup/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => null);
  }, []);

  const copyEnv = async () => {
    await navigator.clipboard.writeText(envTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      id: "node",
      done: localSteps.node,
      title: t("setup.step1Title"),
      desc: t("setup.step1Desc"),
      action: (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">{t("setup.ready")}</p>
      ),
    },
    {
      id: "npm",
      done: localSteps.npm,
      title: t("setup.step2Title"),
      desc: t("setup.step2Desc"),
      action: (
        <code className="text-xs bg-surface-elevated px-2 py-1 rounded">npm install</code>
      ),
    },
    {
      id: "supabase",
      done: status?.supabase ?? false,
      title: t("setup.step3Title"),
      desc: t("setup.step3Desc"),
      action: (
        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-lifemed-600 hover:underline"
        >
          {t("setup.supabaseDashboard")} <ExternalLink className="h-3 w-3" />
        </a>
      ),
    },
    {
      id: "env",
      done: status?.supabase ?? false,
      title: t("setup.step4Title"),
      desc: t("setup.step4Desc"),
      action: (
        <div className="space-y-2">
          <Button variant="secondary" size="sm" onClick={copyEnv}>
            <Copy className="h-4 w-4" />
            {copied ? t("setup.copied") : t("setup.copyTemplate")}
          </Button>
          <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={localSteps.envFile}
              onChange={(e) => setLocalSteps((s) => ({ ...s, envFile: e.target.checked }))}
            />
            {t("setup.envCheckbox")}
          </label>
        </div>
      ),
    },
    {
      id: "schema",
      done: localSteps.schema,
      title: t("setup.step5Title"),
      desc: t("setup.step5Desc"),
      action: (
        <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={localSteps.schema}
            onChange={(e) => setLocalSteps((s) => ({ ...s, schema: e.target.checked }))}
          />
          {t("setup.schemaCheckbox")}
        </label>
      ),
    },
    {
      id: "auth",
      done: status?.supabase ?? false,
      title: t("setup.step6Title"),
      desc: t("setup.step6Desc"),
      action: (
        <code className="block text-xs bg-surface-elevated px-2 py-1 rounded break-all">
          {status?.redirectUrl ?? "http://localhost:3000/auth/callback"}
        </code>
      ),
    },
    {
      id: "service",
      done: status?.serviceRole ?? false,
      title: t("setup.step7Title"),
      desc: t("setup.step7Desc"),
      action: status?.serviceRole ? (
        <Badge variant="success">{t("setup.configured")}</Badge>
      ) : (
        <Badge variant="warning">{t("setup.optionalDemo")}</Badge>
      ),
    },
    {
      id: "restart",
      done: status?.supabase ?? false,
      title: t("setup.step8Title"),
      desc: t("setup.step8Desc"),
      action: (
        <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={localSteps.restart}
            onChange={(e) => setLocalSteps((s) => ({ ...s, restart: e.target.checked }))}
          />
          {t("setup.restartCheckbox")}
        </label>
      ),
    },
    {
      id: "account",
      done: localSteps.account,
      title: t("setup.step9Title"),
      desc: t("setup.step9Desc"),
      action: (
        <div className="flex flex-wrap gap-2">
          <Link href="/signup">
            <Button size="sm" variant="secondary">
              <UserPlus className="h-4 w-4" />
              {t("auth.signUp")}
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm">
              {t("nav.home")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const allCoreDone = status?.supabase && localSteps.schema;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <div>
              <p className="font-semibold">{APP_NAME} Setup</p>
              <p className="text-xs text-muted">{t("setup.headerSubtitle")}</p>
            </div>
          </div>
          <LanguageSwitcher size="sm" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <Card className="gradient-soft border-lifemed-200 dark:border-lifemed-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold">{t("setup.progressTitle")}</h1>
                <p className="text-sm text-muted mt-1">
                  {t("setup.progressSteps", { completed: completedCount, total: steps.length })}
                </p>
              </div>
              {allCoreDone ? (
                <Badge variant="success" className="text-sm px-3 py-1">
                  {t("setup.badgeLiveReady")}
                </Badge>
              ) : (
                <Badge variant="info">{t("setup.badgeDemoWorks")}</Badge>
              )}
            </div>
            <div className="mt-4 h-2 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-lifemed-500 transition-all duration-500"
                style={{ width: `${(completedCount / steps.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {status && !status.supabase && (
          <>
            <Card className="border-amber-200 dark:border-amber-800">
              <CardContent className="p-4 text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  {t("setup.demoModeTitle")}
                </p>
                <p className="text-muted mt-1">{t("setup.demoModeDesc")}</p>
              </CardContent>
            </Card>
            <Card className="border-lifemed-200 dark:border-lifemed-800">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">{t("setup.registerTitle")}</p>
                  <p className="text-sm text-muted mt-1">{t("setup.registerDesc")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="secondary">
                      <ExternalLink className="h-4 w-4" />
                      {t("setup.registerOpenSupabase")}
                    </Button>
                  </a>
                  <Button size="sm" onClick={copyEnv}>
                    <Copy className="h-4 w-4" />
                    {copied ? t("setup.copied") : t("setup.copyTemplate")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <div className="space-y-4">
          {steps.map((step) => (
            <Card key={step.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  {step.done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted" />
                  )}
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted">{step.desc}</p>
                {step.action}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-lifemed-500" />
              {t("setup.quickCommands")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 font-mono text-xs">
            <p className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted shrink-0" />
              cd Projects/LifeMed && npm run dev
            </p>
            <p className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted shrink-0" />
              schema: supabase/schema.sql
            </p>
            <p className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted shrink-0" />
              env: .env.local (copy from .env.example)
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-center pb-8">
          <Link href="/dashboard">
            <Button size="lg">
              {allCoreDone ? t("setup.goDashboard") : t("setup.viewDemoDashboard")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
