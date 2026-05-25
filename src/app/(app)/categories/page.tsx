"use client";

import { useMemo, useState } from "react";
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
  Eye,
  FileText,
} from "lucide-react";
import { ExpandableCard } from "@/components/ui/expandable-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataModeBanner } from "@/components/layout/data-mode-banner";
import { DocumentViewerModal } from "@/components/documents/document-viewer-modal";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { useHealthCategoryLabel } from "@/lib/i18n/hooks";
import { HEALTH_CATEGORIES } from "@/lib/constants";
import { buildCategoryRecords } from "@/lib/health/categories";
import { formatDate } from "@/lib/utils";
import type { CategoryRecord, HealthDocument } from "@/types/health";

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

function getDocumentForRecord(record: CategoryRecord, documents: HealthDocument[]) {
  const documentId = record.documentId ?? (record.id.startsWith("doc-") ? record.id.slice(4) : null);
  if (!documentId) return null;
  return documents.find((doc) => doc.id === documentId) ?? null;
}

export default function CategoriesPage() {
  const { t, locale } = useTranslation();
  const getHealthCategoryLabel = useHealthCategoryLabel();
  const { mode, loading, timeline, documents, profile, resolveDocumentUrl, downloadDocument } =
    useHealthDataContext();
  const [viewerDoc, setViewerDoc] = useState<HealthDocument | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const categoryRecords = useMemo(
    () => buildCategoryRecords(timeline, documents, profile, locale),
    [timeline, documents, profile, locale]
  );

  const openDocumentRecord = (record: CategoryRecord) => {
    const doc = getDocumentForRecord(record, documents);
    if (!doc) return;
    setActionError(null);
    setViewerDoc(doc);
  };

  if (loading) {
    return <div className="py-20 text-center text-muted">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-8">
      <DataModeBanner mode={mode} />
      {actionError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
          {actionError}
        </div>
      )}
      <DocumentViewerModal
        open={Boolean(viewerDoc)}
        document={viewerDoc}
        onClose={() => setViewerDoc(null)}
        resolveUrl={resolveDocumentUrl}
        onDownload={async (doc) => {
          const { error } = await downloadDocument(doc);
          if (error) setActionError(error);
          return { error };
        }}
      />
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
                  {records.map((record) => {
                    const linkedDocument = getDocumentForRecord(record, documents);
                    const isDocument = Boolean(linkedDocument);

                    if (isDocument && linkedDocument) {
                      return (
                        <div
                          key={record.id}
                          className="rounded-xl border border-border transition-colors hover:border-lifemed-300 hover:bg-surface-elevated"
                        >
                          <div className="flex items-start gap-3 p-4">
                            <button
                              type="button"
                              onClick={() => openDocumentRecord(record)}
                              className="relative z-10 flex min-w-0 flex-1 items-start gap-3 text-left"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lifemed-50 text-lifemed-600 dark:bg-lifemed-950/50">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium text-foreground">{record.title}</h4>
                                <p className="mt-1 text-sm text-muted">{record.summary}</p>
                                {record.details && (
                                  <p className="mt-2 text-xs leading-relaxed text-muted">{record.details}</p>
                                )}
                              </div>
                            </button>
                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <time className="text-xs text-lifemed-600 dark:text-lifemed-400">
                                {formatDate(record.date, locale)}
                              </time>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="relative z-10 h-8 w-8"
                                aria-label={t("documents.view")}
                                onClick={() => openDocumentRecord(record)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={record.id}
                        className="rounded-xl border border-border p-4 transition-colors hover:bg-surface-elevated"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-medium text-foreground">{record.title}</h4>
                            <p className="mt-1 text-sm text-muted">{record.summary}</p>
                            {record.details && (
                              <p className="mt-2 text-xs leading-relaxed text-muted">{record.details}</p>
                            )}
                          </div>
                          <time className="shrink-0 text-xs text-lifemed-600 dark:text-lifemed-400">
                            {formatDate(record.date, locale)}
                          </time>
                        </div>
                      </div>
                    );
                  })}
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
