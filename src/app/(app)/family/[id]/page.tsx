"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddFamilyMemberModal } from "@/components/family/add-family-member-modal";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { demoFamilyHealthNotes } from "@/data/demo-data";
import { useRelationshipLabel } from "@/lib/i18n/hooks";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Baby, UserCircle, Calendar, ShieldAlert, Syringe, Pencil } from "lucide-react";

export default function FamilyMemberPage() {
  const { t, locale } = useTranslation();
  const getRelationshipLabel = useRelationshipLabel();
  const params = useParams();
  const router = useRouter();
  const { familyMembers, loading, isDemo } = useHealthDataContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const member = familyMembers.find((m) => m.id === params.id);

  if (loading) {
    return <div className="py-20 text-center text-muted">{t("common.loading")}</div>;
  }

  if (!member) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-muted">{t("family.notFound")}</p>
        <Button variant="secondary" onClick={() => router.push("/family")}>
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
      </div>
    );
  }

  const age = member.dateOfBirth
    ? new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear()
    : null;
  const Icon = age !== null && age < 18 ? Baby : UserCircle;
  const healthNotes = isDemo ? demoFamilyHealthNotes[member.id] ?? [] : [];

  return (
    <div className="space-y-8">
      <Button variant="ghost" onClick={() => router.push("/family")} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        {t("family.backToFamily")}
      </Button>

      <AddFamilyMemberModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        member={member}
      />

      <Card>
        <CardContent className="flex flex-col sm:flex-row items-center gap-6 p-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-lifemed-50 text-lifemed-600 dark:bg-lifemed-950/50">
            <Icon className="h-10 w-10" />
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold">{member.name}</h1>
              <Badge>{getRelationshipLabel(member.relationship)}</Badge>
            </div>
            {member.dateOfBirth && age !== null && (
              <p className="text-muted mt-1">
                {t("family.bornAge", {
                  date: formatDate(member.dateOfBirth, locale),
                  age,
                })}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" onClick={() => setShowEditModal(true)}>
              <Pencil className="h-4 w-4" />
              {t("common.edit")}
            </Button>
            <Button variant="secondary" onClick={() => router.push("/emergency")}>
              <ShieldAlert className="h-4 w-4" />
              {t("family.emergencyCard")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-lifemed-500" />
            {t("family.timelineTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {healthNotes.length === 0 ? (
            <p className="text-sm text-muted">{t("family.managedNote")}</p>
          ) : (
            healthNotes.map((note) => (
              <div
                key={`${note.titleKey}-${note.date}`}
                className="flex items-center justify-between rounded-xl border border-border p-3"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {t(`family.demoNotes.${note.titleKey}`)}
                  </p>
                  <p className="text-xs text-muted">{t(`family.demoNotes.${note.typeKey}`)}</p>
                </div>
                <time className="text-xs text-lifemed-600 dark:text-lifemed-400">
                  {formatDate(note.date, locale)}
                </time>
              </div>
            ))
          )}

          {healthNotes.length > 0 && (
            <p className="text-xs text-muted pt-2">{t("family.managedNote")}</p>
          )}
        </CardContent>
      </Card>

      {age !== null && age < 18 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Syringe className="h-4 w-4 text-lifemed-500" />
              {t("family.vaccinationsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted">{t("family.vaccinationsHint")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
