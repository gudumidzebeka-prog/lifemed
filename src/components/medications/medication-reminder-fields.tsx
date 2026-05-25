"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers/locale-provider";
import { Plus, X } from "lucide-react";

interface MedicationReminderFieldsProps {
  times: string[];
  onChange: (times: string[]) => void;
}

export function MedicationReminderFields({ times, onChange }: MedicationReminderFieldsProps) {
  const { t } = useTranslation();
  const value = times.length > 0 ? times : [""];

  const updateTime = (index: number, nextValue: string) => {
    const next = [...value];
    next[index] = nextValue;
    onChange(next);
  };

  const addTime = () => {
    onChange([...value, "09:00"]);
  };

  const removeTime = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">{t("modals.medReminderTimes")}</p>
        <p className="mt-1 text-xs text-muted">{t("modals.medReminderTimesHint")}</p>
      </div>
      <div className="space-y-2">
        {value.map((time, index) => (
          <div key={`${index}-${time}`} className="flex items-center gap-2">
            <input
              type="time"
              value={time}
              onChange={(event) => updateTime(index, event.target.value)}
              className="h-11 flex-1 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-lifemed-400"
              aria-label={t("modals.medReminderTimes")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label={t("modals.medRemoveTime")}
              onClick={() => removeTime(index)}
              disabled={value.length === 1 && !time}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={addTime}>
        <Plus className="h-4 w-4" />
        {t("modals.medAddTime")}
      </Button>
    </div>
  );
}
