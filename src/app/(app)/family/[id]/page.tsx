"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddFamilyMemberModal } from "@/components/family/add-family-member-modal";
import { FamilyMemberAvatar } from "@/components/family/family-member-avatar";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { useRelationshipLabel } from "@/lib/i18n/hooks";
import { formatDate } from "@/lib/utils";
import { calculateAge, isMinor } from "@/lib/health/profile-dates";
import { ArrowLeft, Syringe, Pencil } from "lucide-react";

export default function FamilyMemberPage() {
  const { t, locale } = useTranslation();
  const getRelationshipLabel = useRelationshipLabel();
  const params = useParams();
  const router = useRouter();
  const { familyMembers, loading } = useHealthDataContext();
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

  const age = calculateAge(member.dateOfBirth);
  const isChild = isMinor(member.dateOfBirth);

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
          <FamilyMemberAvatar
            name={member.name}
            avatarUrl={member.avatarUrl}
            isChild={isChild}
            size="lg"
          />
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
          <Button variant="secondary" onClick={() => setShowEditModal(true)}>
            <Pencil className="h-4 w-4" />
            {t("common.edit")}
          </Button>
        </CardContent>
      </Card>

      {isChild && (
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
