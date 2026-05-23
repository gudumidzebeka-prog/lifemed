"use client";

import {
  Heart,
  Brain,
  Droplets,
  Shield,
  Sparkles,
  Pill,
  AlertTriangle,
  Syringe,
  Scissors,
  FlaskConical,
} from "lucide-react";
import { ExpandableCard } from "@/components/ui/expandable-card";
import { Badge } from "@/components/ui/badge";
import { DataModeBanner } from "@/components/layout/data-mode-banner";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { useHealthCategoryLabel } from "@/lib/i18n/hooks";
import { HEALTH_CATEGORIES } from "@/lib/constants";
import { buildCategoryRecords } from "@/lib/health/categories";
import { formatDate } from "@/lib/utils";

const iconMap = {
  Heart,
  Brain,
  Droplets,
  Shield,
  Sparkles,
  Pill,
  AlertTriangle,
  Syringe,
  Scissors,
  FlaskConical,
};

export default function CategoriesPage() {
  const { t, locale } = useTranslation();
  const getHealthCategoryLabel = useHealthCategoryLabel();
  const { mode, loading, timeline, documents, profile } = useHealthDataContext();
  const categoryRecords = buildCategoryRecords(timeline, documents, profile, locale);

  if (loading) {
    return <div className="py-20 text-center text-muted">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-8">
      <DataModeBanner mode={mode} />
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("categories.title")}</h1>
        <p className="mt-1 text-muted">{t("categories.subtitle")}</p>
      </div>

      <div className="space-y-4">
        {HEALTH_CATEGORIES.map((category) => {
          const Icon = iconMap[category.icon as keyof typeof iconMap];
          const records = categoryRecords[category.id] || [];
          const count = records.length;
          const label = getHealthCategoryLabel(category.id);

          return (
            <ExpandableCard
              key={category.id}
              title={label}
              subtitle={
                count > 0
                  ? `${count} ${count > 1 ? t("common.records") : t("common.record")}`
                  : t("categories.noRecords")
              }
              icon={<Icon className="h-5 w-5" />}
              badge={count > 0 ? <Badge>{count}</Badge> : undefined}
            >
              {records.length > 0 ? (
                <div className="space-y-3">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      className="rounded-xl border border-border p-4 transition-colors hover:bg-surface-elevated"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-medium text-foreground">{record.title}</h4>
                          <p className="text-sm text-muted mt-1">{record.summary}</p>
                          {record.details && (
                            <p className="text-xs text-muted mt-2 leading-relaxed">{record.details}</p>
                          )}
                        </div>
                        <time className="text-xs text-lifemed-600 dark:text-lifemed-400 shrink-0">
                          {formatDate(record.date, locale)}
                        </time>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted py-2">{t("categories.emptyCategory")}</p>
              )}
            </ExpandableCard>
          );
        })}
      </div>
    </div>
  );
}
