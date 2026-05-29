"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/components/providers/locale-provider";
import { getCategoryPageHref } from "@/lib/health/categories";
import {
  addFlare,
  getChronicCondition,
  getConditionChecklist,
  loadFlares,
  toggleChecklistItem,
  type ChronicConditionId,
} from "@/lib/health/chronic-conditions";
import { recordWellnessActivity } from "@/lib/health/wellness";
import { formatDate } from "@/lib/utils";
import { AlertTriangle, Apple, ClipboardList, Flame } from "lucide-react";

export default function ConditionModulePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const condition = getChronicCondition(id);

  if (!condition) {
    return (
      <div className="py-20 text-center text-muted">
        <Link href="/conditions">←</Link>
      </div>
    );
  }

  return <ConditionModuleContent conditionId={condition.id} categoryId={condition.categoryId} />;
}

function ConditionModuleContent({
  conditionId,
  categoryId,
}: {
  conditionId: ChronicConditionId;
  categoryId: string;
}) {
  const { t, locale } = useTranslation();
  const moduleKey = `conditions.modules.${conditionId}` as const;
  const tips = t(`${moduleKey}.tips` as "conditions.modules.diabetes.tips").split("|");
  const warnings = t(`${moduleKey}.warnings` as "conditions.modules.diabetes.warnings").split("|");
  const checklistItems = t(`${moduleKey}.checklist` as "conditions.modules.diabetes.checklist").split("|");

  const [checklist, setChecklist] = useState(() => getConditionChecklist(conditionId));
  const [flares, setFlares] = useState(() => loadFlares(conditionId));
  const [flareNote, setFlareNote] = useState("");
  const [flareSeverity, setFlareSeverity] = useState<1 | 2 | 3>(2);

  const completedCount = useMemo(
    () => checklistItems.filter((_, index) => checklist.checked[`item-${index}`]).length,
    [checklist.checked, checklistItems]
  );

  const toggleItem = (index: number, checked: boolean) => {
    const next = toggleChecklistItem(conditionId, `item-${index}`, checked);
    setChecklist(next);
    if (checked) recordWellnessActivity();
  };

  const logFlare = () => {
    addFlare(conditionId, flareSeverity, flareNote);
    setFlares(loadFlares(conditionId));
    setFlareNote("");
    recordWellnessActivity();
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href="/conditions" className="text-sm text-lifemed-600 no-underline hover:underline dark:text-lifemed-400">
          ← {t("conditions.back")}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          {t(`${moduleKey}.title` as "conditions.modules.diabetes.title")}
        </h1>
        <p className="mt-1 text-muted">{t(`${moduleKey}.summary` as "conditions.modules.diabetes.summary")}</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Apple className="h-5 w-5 text-lifemed-500" />
          <CardTitle className="text-base">{t("conditions.nutritionTips")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted">
            {tips.map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-base">{t("conditions.riskWarnings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted">
            {warnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-lifemed-500" />
            <CardTitle className="text-base">{t("conditions.dailyChecklist")}</CardTitle>
          </div>
          <span className="text-sm text-muted">
            {completedCount}/{checklistItems.length}
          </span>
        </CardHeader>
        <CardContent className="space-y-3">
          {checklistItems.map((item, index) => (
            <label key={item} className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={Boolean(checklist.checked[`item-${index}`])}
                onChange={(e) => toggleItem(index, e.target.checked)}
              />
              <span>{item}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Flame className="h-5 w-5 text-rose-500" />
          <CardTitle className="text-base">{t("conditions.flareTracker")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFlareSeverity(level as 1 | 2 | 3)}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  flareSeverity === level
                    ? "border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/30"
                    : "border-border text-muted"
                }`}
              >
                {t(`conditions.flareLevel.${level}` as "conditions.flareLevel.1")}
              </button>
            ))}
          </div>
          <Input
            label={t("conditions.flareNote")}
            value={flareNote}
            onChange={(e) => setFlareNote(e.target.value)}
          />
          <Button type="button" onClick={logFlare}>
            {t("conditions.logFlare")}
          </Button>
          {flares.length > 0 ? (
            <div className="space-y-2 border-t border-border pt-4">
              {flares.slice(0, 5).map((flare) => (
                <div key={flare.id} className="flex items-center justify-between text-sm">
                  <span>
                    {t(`conditions.flareLevel.${flare.severity}` as "conditions.flareLevel.1")}
                    {flare.note ? ` · ${flare.note}` : ""}
                  </span>
                  <time className="text-xs text-muted">{formatDate(flare.recordedAt, locale)}</time>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Button variant="secondary" href={getCategoryPageHref(categoryId)}>
        {t("conditions.openCategoryRecords")}
      </Button>
    </div>
  );
}
