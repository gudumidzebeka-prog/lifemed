"use client";

import { Suspense } from "react";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { profileGenderLabel } from "@/lib/health/profile-gender";
import { displayFirstName } from "@/lib/health/empty-profile";
import { ProfileEditSection } from "@/components/profile/profile-edit-section";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import {
  MedicalShareQr,
  MedicalShareQrBottomSection,
} from "@/components/share/medical-share-qr";
import { Droplets } from "lucide-react";

export default function ProfilePage() {
  const { t } = useTranslation();

  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">{t("common.loading")}</div>}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const { t, locale } = useTranslation();
  const { loading, profile } = useHealthDataContext();

  if (loading) {
    return <div className="py-20 text-center text-muted">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("profile.title")}</h1>
        <p className="mt-1 text-muted">{t("profile.subtitle")}</p>
      </div>

      <Card>
        <CardContent className="flex items-start gap-3 p-6 sm:gap-4 sm:p-8">
          <ProfileAvatar
            fullName={profile.fullName}
            avatarUrl={profile.avatarUrl}
            editable
          />
          <div className="text-left flex-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground">
              {profile.fullName.trim() || displayFirstName(profile.fullName)}
            </h2>
            <p className="text-muted mt-1">
              {profile.dateOfBirth
                ? t("profile.born", {
                    date: formatDate(profile.dateOfBirth, locale, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }),
                  })
                : t("profile.dobMissing")}
            </p>
            <p className="text-sm text-muted mt-1">
              {profile.city ? profile.city : t("profile.cityMissing")}
            </p>
            <p className="text-sm text-muted mt-1">
              {profile.gender
                ? profileGenderLabel(profile.gender, t)
                : t("profile.genderMissing")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 justify-start">
              {profile.bloodType && (
                <Badge variant="info">
                  <Droplets className="h-3 w-3" />
                  {profile.bloodType}
                </Badge>
              )}
              {profile.chronicIllnesses.map((illness) => (
                <Badge key={illness} variant="warning">
                  {illness}
                </Badge>
              ))}
            </div>
          </div>
          <MedicalShareQr
            size="sm"
            title={t("profile.medicalQrTitle")}
            className="hidden shrink-0 md:block"
          />
        </CardContent>
      </Card>

      <ProfileEditSection />

      <MedicalShareQrBottomSection className="md:hidden" />
    </div>
  );
}
