"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Disclaimer } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslation } from "@/components/providers/locale-provider";
import { useDocumentCategoryLabel, useMedicationFrequencyLabel, useRelationshipLabel } from "@/lib/i18n/hooks";
import { APP_NAME } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Heart, Shield, Clock, FileText, Loader2, Phone, Mail } from "lucide-react";
import type { HealthDocument, HealthProfile, TimelineEvent } from "@/types/health";

interface SharePayload {
  expiresAt: string;
  scopes: string[];
  profile?: HealthProfile;
  timeline?: TimelineEvent[];
  documents?: HealthDocument[];
}

export default function PublicSharePage() {
  const params = useParams();
  const token = params.token as string;
  const { t, locale } = useTranslation();
  const getDocumentCategoryLabel = useDocumentCategoryLabel();
  const getMedicationFrequencyLabel = useMedicationFrequencyLabel();
  const getRelationshipLabel = useRelationshipLabel();
  const [data, setData] = useState<SharePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? t("share.linkInvalid"));
        }
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-lifemed-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Shield className="mx-auto h-12 w-12 text-muted/40" />
            <h1 className="mt-4 text-lg font-semibold">{t("share.linkBroken")}</h1>
            <p className="mt-2 text-sm text-muted">{error ?? t("share.linkExpired")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profile = data.profile;
  const showEmergencyDetails = data.scopes.includes("emergency");

  const scopeLabels: Record<string, string> = {
    timeline: t("share.scopeTimeline"),
    documents: t("share.scopeDocuments"),
    profile: t("share.scopeProfile"),
    emergency: t("share.scopeEmergency"),
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <div>
              <p className="font-semibold">{APP_NAME}</p>
              <p className="text-xs text-muted">{t("share.publicSubtitle")}</p>
            </div>
          </div>
          <LanguageSwitcher size="sm" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <Disclaimer variant="medical" />

        <div className="flex flex-wrap gap-2">
          {data.scopes.map((scope) => (
            <Badge key={scope} variant="info">
              {scopeLabels[scope] ?? scope}
            </Badge>
          ))}
          <Badge variant="warning">
            {t("common.expires", { date: formatDate(data.expiresAt, locale) })}
          </Badge>
        </div>

        {(data.scopes.includes("profile") || showEmergencyDetails) && profile && (
          <Card>
            <CardHeader>
              <CardTitle>{profile.fullName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {profile.dateOfBirth && (
                <p>
                  {t("share.dobLabel")}{" "}
                  <strong>
                    {formatDate(profile.dateOfBirth, locale, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </strong>
                </p>
              )}
              {profile.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted" />
                  <span>
                    {t("share.phoneLabel")} <strong>{profile.phone}</strong>
                  </span>
                </p>
              )}
              {profile.email && (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted" />
                  <span>
                    {t("share.emailLabel")} <strong>{profile.email}</strong>
                  </span>
                </p>
              )}
              {profile.bloodType && (
                <p>
                  {t("share.bloodTypeLabel")} <strong>{profile.bloodType}</strong>
                </p>
              )}
              {profile.allergies.length > 0 && (
                <p>
                  {t("share.allergiesLabel")} {profile.allergies.join(", ")}
                </p>
              )}
              {profile.chronicIllnesses.length > 0 && (
                <p>
                  {t("share.chronicLabel")} {profile.chronicIllnesses.join(", ")}
                </p>
              )}
              {profile.currentMedications.length > 0 && (
                <div>
                  <p className="font-medium mb-1">{t("share.medicationsLabel")}</p>
                  <ul className="space-y-1 text-muted">
                    {profile.currentMedications.map((m) => (
                      <li key={m.id}>
                        • {m.name} — {m.dosage}, {getMedicationFrequencyLabel(m.frequency)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {showEmergencyDetails && profile && profile.emergencyContacts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("share.contactsLabel")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.emergencyContacts.map((contact) => (
                <div key={contact.id} className="rounded-xl border border-border p-4">
                  <p className="font-semibold text-foreground">{contact.name}</p>
                  <p className="text-sm text-muted">{getRelationshipLabel(contact.relationship)}</p>
                  <a
                    href={`tel:${contact.phone.replace(/\D/g, "")}`}
                    className="mt-2 inline-flex items-center gap-2 font-medium text-lifemed-600 dark:text-lifemed-400"
                  >
                    <Phone className="h-4 w-4" />
                    {contact.phone}
                  </a>
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="mt-1 inline-flex items-center gap-2 text-sm text-muted"
                    >
                      <Mail className="h-4 w-4" />
                      {contact.email}
                    </a>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {data.scopes.includes("timeline") && data.timeline && data.timeline.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t("share.timelineTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...data.timeline].reverse().slice(0, 10).map((event) => (
                <div key={event.id} className="border-b border-border pb-3 last:border-0">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-xs text-muted">{formatDate(event.date, locale)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {data.scopes.includes("documents") && data.documents && data.documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("share.documentsTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.documents.map((doc) => (
                <p key={doc.id} className="text-sm">
                  {doc.name} · <span className="text-muted">{getDocumentCategoryLabel(doc.category)}</span>
                </p>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
