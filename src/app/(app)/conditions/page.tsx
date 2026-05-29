"use client";

import Link from "next/link";
import { CHRONIC_CONDITIONS } from "@/lib/health/chronic-conditions";
import { getCategoryPageHref } from "@/lib/health/categories";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthCategoryLabel } from "@/lib/i18n/hooks";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  ChevronRight,
  Droplets,
  Heart,
  HeartHandshake,
  Shield,
} from "lucide-react";

const iconMap = {
  Activity,
  Shield,
  Droplets,
  Heart,
  HeartHandshake,
};

export default function ConditionsPage() {
  const { t } = useTranslation();
  const getHealthCategoryLabel = useHealthCategoryLabel();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("conditions.title")}</h1>
        <p className="mt-1 text-muted">{t("conditions.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {CHRONIC_CONDITIONS.map((condition) => {
          const Icon = iconMap[condition.icon as keyof typeof iconMap] ?? Activity;
          return (
            <Card key={condition.id} className="card-hover overflow-hidden">
              <CardContent className="p-0">
                <Link
                  href={`/conditions/${condition.id}`}
                  className="flex items-center gap-4 p-5 no-underline text-inherit"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lifemed-50 text-lifemed-600 dark:bg-lifemed-950/50">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">
                      {t(`conditions.modules.${condition.id}.title` as "conditions.modules.diabetes.title")}
                    </p>
                    <p className="text-sm text-muted">
                      {getHealthCategoryLabel(condition.categoryId)} · {t("conditions.moduleIncludes")}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted" />
                </Link>
                <div className="border-t border-border px-5 py-3">
                  <Link
                    href={getCategoryPageHref(condition.categoryId)}
                    className="text-sm text-lifemed-600 no-underline hover:underline dark:text-lifemed-400"
                  >
                    {t("conditions.openCategoryRecords")}
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
