"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, Disclaimer } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShareQrCode } from "@/components/share/share-qr-code";
import { useTranslation } from "@/components/providers/locale-provider";
import {
  QrCode,
  Link2,
  Copy,
  Check,
  Clock,
  Shield,
  Eye,
  Download,
} from "lucide-react";

const EXPIRY_OPTIONS = [
  { hours: 1, key: "share.expiry1h" },
  { hours: 24, key: "share.expiry1day" },
  { hours: 72, key: "share.expiry3days" },
  { hours: 168, key: "share.expiry1week" },
] as const;

export default function SharePage() {
  const { t } = useTranslation();
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["timeline", "profile"]);
  const [expiryHours, setExpiryHours] = useState(24);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const shareScopes = useMemo(
    () => [
      { id: "timeline", label: t("share.scopeTimeline"), icon: Clock },
      { id: "documents", label: t("share.scopeDocuments"), icon: Download },
      { id: "profile", label: t("share.scopeProfile"), icon: Eye },
      { id: "emergency", label: t("share.scopeEmergency"), icon: Shield },
    ],
    [t]
  );

  const expiryLabel = useMemo(() => {
    const option = EXPIRY_OPTIONS.find((o) => o.hours === expiryHours);
    return option ? t(option.key) : `${expiryHours}h`;
  }, [expiryHours, t]);

  const toggleScope = (id: string) => {
    setSelectedScopes((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const generateLink = async () => {
    setGenerating(true);
    setShareError(null);

    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scopes: selectedScopes, expiryHours }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("share.generateFailed"));

      setGeneratedLink(data.url);
      setShowQR(true);
    } catch (e) {
      setShareError(e instanceof Error ? e.message : t("common.errorGeneric"));
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("share.title")}</h1>
        <p className="mt-1 text-muted">{t("share.subtitle")}</p>
      </div>

      <Disclaimer variant="privacy" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("share.settingsTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium text-foreground mb-3">{t("share.whatToShare")}</p>
              <div className="grid grid-cols-2 gap-2">
                {shareScopes.map((scope) => {
                  const Icon = scope.icon;
                  const selected = selectedScopes.includes(scope.id);
                  return (
                    <button
                      key={scope.id}
                      type="button"
                      onClick={() => toggleScope(scope.id)}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-sm transition-all ${
                        selected
                          ? "border-lifemed-400 bg-lifemed-50 dark:bg-lifemed-950/30 text-lifemed-700 dark:text-lifemed-300"
                          : "border-border hover:border-lifemed-200"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {scope.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-3">{t("share.expiryLabel")}</p>
              <div className="flex gap-2">
                {EXPIRY_OPTIONS.map(({ hours, key }) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setExpiryHours(hours)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      expiryHours === hours
                        ? "bg-lifemed-500 text-white"
                        : "bg-surface-elevated text-muted border border-border"
                    }`}
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={generateLink}
              disabled={selectedScopes.length === 0 || generating}
              className="w-full"
            >
              <Link2 className="h-4 w-4" />
              {generating ? t("share.generating") : t("share.generateLink")}
            </Button>
            {shareError && <p className="text-sm text-rose-600">{shareError}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-lifemed-500" />
              {t("share.accessCode")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedLink ? (
              <div className="space-y-6">
                {showQR && (
                  <div className="flex justify-center">
                    <ShareQrCode value={generatedLink} />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t("share.shareLink")}</label>
                  <div className="flex gap-2">
                    <Input value={generatedLink} readOnly className="text-xs" />
                    <Button variant="secondary" size="icon" onClick={copyLink}>
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedScopes.map((scope) => (
                    <Badge key={scope} variant="info">
                      {shareScopes.find((s) => s.id === scope)?.label}
                    </Badge>
                  ))}
                  <Badge variant="warning">{t("share.expiresIn", { duration: expiryLabel })}</Badge>
                </div>

                <p className="text-xs text-muted">{t("share.readOnlyNote")}</p>
              </div>
            ) : (
              <div className="py-12 text-center">
                <QrCode className="mx-auto h-16 w-16 text-muted/30" />
                <p className="mt-4 text-muted">{t("share.emptyState")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
