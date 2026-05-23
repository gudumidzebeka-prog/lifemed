"use client";

import { useCallback } from "react";
import { useTranslation } from "@/components/providers/locale-provider";
import type { TimelineEvent } from "@/types/health";

const RELATIONSHIP_LABEL_KEYS: Record<string, string> = {
  child: "modals.relChild",
  daughter: "modals.relChild",
  son: "modals.relChild",
  parent: "modals.relParent",
  father: "modals.relParent",
  mother: "modals.relParent",
  spouse: "modals.relSpouse",
  husband: "modals.relSpouse",
  wife: "modals.relSpouse",
  sibling: "modals.relSibling",
  brother: "modals.relSibling",
  sister: "modals.relSibling",
  grandparent: "modals.relGrandparent",
  grandmother: "modals.relGrandparent",
  grandfather: "modals.relGrandparent",
};

export function useTimelineTypeLabel() {
  const { t } = useTranslation();
  return useCallback(
    (type: TimelineEvent["type"]) => t(`timelineTypes.${type}`),
    [t]
  );
}

export function useDocumentCategoryLabel() {
  const { dict } = useTranslation();
  return useCallback(
    (category: string) =>
      dict.documents.categories[category as keyof typeof dict.documents.categories] ?? category,
    [dict]
  );
}

export function useHealthCategoryLabel() {
  const { dict } = useTranslation();
  return useCallback(
    (id: string) =>
      dict.categories.health[id as keyof typeof dict.categories.health] ?? id,
    [dict]
  );
}

export function useRelationshipLabel() {
  const { t } = useTranslation();
  return useCallback(
    (relationship: string) => {
      const key = RELATIONSHIP_LABEL_KEYS[relationship.trim().toLowerCase()];
      return key ? t(key) : relationship;
    },
    [t]
  );
}

export function useMedicationFrequencyLabel() {
  const { t } = useTranslation();
  return useCallback(
    (frequency: string) => {
      const normalized = frequency.trim().toLowerCase();
      if (normalized === "once daily" || normalized === "daily") {
        return t("modals.medFrequencyDefault");
      }
      return frequency;
    },
    [t]
  );
}
