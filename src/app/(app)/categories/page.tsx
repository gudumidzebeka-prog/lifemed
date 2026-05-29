"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  Pencil,
  Plus,
  Activity,
  Wind,
  Bone,
  BrainCircuit,
  MessageCircle,
  Accessibility,
  Bandage,
  Ear,
  TestTube,
  HeartHandshake,
  UserRound,
  ShieldAlert,
  Ribbon,
  Droplet,
  Bug,
  Microscope,
  Baby,
  Dumbbell,
  Skull,
  Dna,
  ScanFace,
  Smile,
  Moon,
  Apple,
  Utensils,
} from "lucide-react";
import { ExpandableCard } from "@/components/ui/expandable-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DocumentViewerModal } from "@/components/documents/document-viewer-modal";
import { UploadDocumentModal } from "@/components/documents/upload-document-modal";
import { AddMedicationModal } from "@/components/profile/add-medication-modal";
import { AllergyManageModal } from "@/components/profile/allergy-manage-modal";
import { AddTimelineEventModal } from "@/components/timeline/add-event-modal";
import { EditTimelineEventModal } from "@/components/timeline/edit-event-modal";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { useHealthCategoryLabel } from "@/lib/i18n/hooks";
import { HEALTH_CATEGORIES } from "@/lib/constants";
import {
  buildCategoryRecords,
  getCategoryAddAction,
  resolveCategoryRecordAction,
} from "@/lib/health/categories";
import { formatDate } from "@/lib/utils";
import type { CategoryRecord, HealthDocument, Medication, TimelineEvent, TimelineEventType } from "@/types/health";

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
  Activity,
  Wind,
  Bone,
  BrainCircuit,
  MessageCircle,
  Accessibility,
  Bandage,
  Eye,
  Ear,
  TestTube,
  HeartHandshake,
  UserRound,
  ShieldAlert,
  Ribbon,
  Droplet,
  Bug,
  Microscope,
  Baby,
  Dumbbell,
  Skull,
  Dna,
  ScanFace,
  Smile,
  Moon,
  Apple,
  Utensils,
};

function getDocumentForRecord(record: CategoryRecord, documents: HealthDocument[]) {
  const action = resolveCategoryRecordAction(record);
  if (action?.type !== "document") return null;
  return documents.find((doc) => doc.id === action.documentId) ?? null;
}

export default function CategoriesPage() {
  const { t } = useTranslation();

  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">{t("common.loading")}</div>}>
      <CategoriesContent />
    </Suspense>
  );
}

function CategoriesContent() {
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();
  const focusedCategory = searchParams.get("category");
  const getHealthCategoryLabel = useHealthCategoryLabel();
  const { loading, timeline, documents, profile, resolveDocumentUrl, downloadDocument } =
    useHealthDataContext();
  const [viewerDoc, setViewerDoc] = useState<HealthDocument | null>(null);
  const [editMedication, setEditMedication] = useState<Medication | null>(null);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocumentCategory, setUploadDocumentCategory] = useState<string | undefined>();
  const [showTimelineAddModal, setShowTimelineAddModal] = useState(false);
  const [timelineAddType, setTimelineAddType] = useState<TimelineEventType>("doctor_visit");
  const [timelineAddCategory, setTimelineAddCategory] = useState<string | undefined>();
  const [editTimelineEvent, setEditTimelineEvent] = useState<TimelineEvent | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const categoryRecords = useMemo(
    () => buildCategoryRecords(timeline, documents, profile, locale),
    [timeline, documents, profile, locale]
  );

  useEffect(() => {
    if (!focusedCategory) return;
    const target = document.getElementById(`category-${focusedCategory}`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusedCategory, loading]);

  const openDocumentRecord = (record: CategoryRecord) => {
    const doc = getDocumentForRecord(record, documents);
    if (!doc) return;
    setActionError(null);
    setViewerDoc(doc);
  };

  const openMedicationModal = (medication: Medication | null = null) => {
    setEditMedication(medication);
    setShowMedicationModal(true);
  };

  const openCategoryAdd = (categoryId: string) => {
    setActionError(null);
    const action = getCategoryAddAction(categoryId);

    switch (action.type) {
      case "medication":
        openMedicationModal(null);
        break;
      case "allergy":
        setShowAllergyModal(true);
        break;
      case "upload":
        setUploadDocumentCategory(action.documentCategory);
        setShowUploadModal(true);
        break;
      case "timeline":
        setTimelineAddType(action.eventType);
        setTimelineAddCategory(action.healthCategory);
        setShowTimelineAddModal(true);
        break;
    }
  };

  const handleRecordClick = (record: CategoryRecord) => {
    const action = resolveCategoryRecordAction(record);
    if (!action) return;

    setActionError(null);

    switch (action.type) {
      case "document":
        openDocumentRecord(record);
        break;
      case "timeline": {
        const event = timeline.find((item) => item.id === action.eventId);
        if (event) setEditTimelineEvent(event);
        break;
      }
      case "medication": {
        const medication = profile.currentMedications.find((item) => item.id === action.medicationId);
        if (medication) openMedicationModal(medication);
        break;
      }
      case "allergy":
        setShowAllergyModal(true);
        break;
    }
  };

  const getRecordIcon = (record: CategoryRecord) => {
    const action = resolveCategoryRecordAction(record);
    if (action?.type === "document") return FileText;
    if (action?.type === "allergy") return AlertTriangle;
    if (action?.type === "medication") return Pill;
    return FileText;
  };

  const getRecordActionIcon = (record: CategoryRecord) => {
    const action = resolveCategoryRecordAction(record);
    if (action?.type === "document") return Eye;
    return Pencil;
  };

  const getRecordAriaLabel = (record: CategoryRecord) => {
    const action = resolveCategoryRecordAction(record);
    if (action?.type === "document") return t("documents.view");
    if (action?.type === "allergy") return t("profile.allergies");
    return t("common.edit");
  };

  const getCategoryAddLabel = (categoryId: string) => {
    const action = getCategoryAddAction(categoryId);
    switch (action.type) {
      case "medication":
        return t("profile.addMedication");
      case "allergy":
        return t("profile.allergies");
      case "upload":
        return t("dashboard.addDocument");
      default:
        return t("dashboard.addTimelineEvent");
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-muted">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-8">
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
      <AddMedicationModal
        open={showMedicationModal}
        onClose={() => {
          setShowMedicationModal(false);
          setEditMedication(null);
        }}
        medication={editMedication}
      />
      <AllergyManageModal open={showAllergyModal} onClose={() => setShowAllergyModal(false)} />
      <UploadDocumentModal
        open={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setUploadDocumentCategory(undefined);
        }}
        initialCategory={uploadDocumentCategory}
      />
      <AddTimelineEventModal
        open={showTimelineAddModal}
        onClose={() => setShowTimelineAddModal(false)}
        initialType={timelineAddType}
        initialCategory={timelineAddCategory}
      />
      <EditTimelineEventModal
        open={Boolean(editTimelineEvent)}
        onClose={() => setEditTimelineEvent(null)}
        event={editTimelineEvent}
      />

      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("categories.title")}</h1>
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
              id={`category-${category.id}`}
              defaultOpen={category.id === focusedCategory}
              title={label}
              addLabel={getCategoryAddLabel(category.id)}
              onAdd={() => openCategoryAdd(category.id)}
              editLabel={t("common.edit")}
              onEdit={
                records[0] ? () => handleRecordClick(records[0]) : undefined
              }
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
                    const action = resolveCategoryRecordAction(record);
                    const RecordIcon = getRecordIcon(record);
                    const ActionIcon = getRecordActionIcon(record);
                    const isClickable = Boolean(action);

                    return (
                      <div
                        key={record.id}
                        className="rounded-xl border border-border transition-colors hover:border-lifemed-300 hover:bg-surface-elevated"
                      >
                        <div className="flex items-start gap-3 p-4">
                          <button
                            type="button"
                            disabled={!isClickable}
                            onClick={() => handleRecordClick(record)}
                            className="relative z-10 flex min-w-0 flex-1 items-start gap-3 text-left disabled:cursor-default disabled:opacity-70"
                            aria-label={getRecordAriaLabel(record)}
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lifemed-50 text-lifemed-600 dark:bg-lifemed-950/50">
                              <RecordIcon className="h-5 w-5" />
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
                            {isClickable ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="relative z-10 h-8 w-8"
                                aria-label={getRecordAriaLabel(record)}
                                onClick={() => handleRecordClick(record)}
                              >
                                <ActionIcon className="h-4 w-4" />
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="relative z-10"
                    onClick={() => openCategoryAdd(category.id)}
                  >
                    <Plus className="h-4 w-4" />
                    {t("common.add")}
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="relative z-10"
                  onClick={() => openCategoryAdd(category.id)}
                >
                  <Plus className="h-4 w-4" />
                  {t("categories.emptyCategory")}
                </Button>
              )}
            </ExpandableCard>
          );
        })}
      </div>
    </div>
  );
}
