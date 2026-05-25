"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddFamilyMemberModal } from "@/components/family/add-family-member-modal";
import { useTranslation } from "@/components/providers/locale-provider";
import { useRelationshipLabel } from "@/lib/i18n/hooks";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { formatDate } from "@/lib/utils";
import { Plus, Users, ChevronRight, Baby, UserCircle } from "lucide-react";
import Link from "next/link";

export default function FamilyPage() {
  const { t, locale } = useTranslation();
  const getRelationshipLabel = useRelationshipLabel();
  const { loading, familyMembers } = useHealthDataContext();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("family.title")}</h1>
          <p className="mt-1 text-muted">{t("family.subtitle")}</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4" />
          {t("family.addMember")}
        </Button>
      </div>

      <AddFamilyMemberModal open={showAddModal} onClose={() => setShowAddModal(false)} />

      <Card className="gradient-soft border-lifemed-200 dark:border-lifemed-800">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lifemed-100 text-lifemed-600 dark:bg-lifemed-900/40">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t("family.infoTitle")}</h3>
            <p className="text-sm text-muted mt-1 leading-relaxed">{t("family.infoDesc")}</p>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-center text-muted py-8">{t("common.loading")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {familyMembers.map((member) => {
            const age = member.dateOfBirth
              ? new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear()
              : null;
            const isChild = age !== null && age < 18;
            const Icon = isChild ? Baby : UserCircle;

            return (
              <Link key={member.id} href={`/family/${member.id}`}>
                <Card className="card-hover cursor-pointer group h-full">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-lifemed-50 text-lifemed-600 dark:bg-lifemed-950/50">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground group-hover:text-lifemed-600 transition-colors">
                          {member.name}
                        </h3>
                        <Badge>{getRelationshipLabel(member.relationship)}</Badge>
                      </div>
                      <p className="text-sm text-muted mt-1">
                        {member.dateOfBirth
                          ? t("family.born", { date: formatDate(member.dateOfBirth, locale) })
                          : t("family.dobNotSet")}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted group-hover:text-lifemed-500 transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          <Card
            className="border-dashed cursor-pointer hover:border-lifemed-300 transition-colors"
            onClick={() => setShowAddModal(true)}
          >
            <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[120px]">
              <Plus className="h-8 w-8 text-muted/40" />
              <p className="mt-2 text-sm font-medium text-muted">{t("family.addMember")}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
