"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "@/components/providers/locale-provider";
import { buildIsoFromParts, parseIsoDateParts } from "@/lib/dates";
import { cn } from "@/lib/utils";

type DateInputProps = {
  value: string;
  onChange: (isoDate: string) => void;
  label?: string;
  id?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
};

export type DateInputHandle = {
  commit: () => string;
};

const defaultInputClassName =
  "flex h-11 w-full rounded-xl border border-border bg-field px-3 py-2 text-sm text-center tabular-nums dark:bg-surface placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lifemed-400 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200";

export const DateInput = forwardRef<DateInputHandle, DateInputProps>(function DateInput(
  { value, onChange, label, id, className, required, disabled },
  ref
) {
  const { t } = useTranslation();
  const initial = parseIsoDateParts(value);
  const [day, setDay] = useState(initial.day);
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parts = parseIsoDateParts(value);
    setDay(parts.day);
    setMonth(parts.month);
    setYear(parts.year);
  }, [value]);

  const commit = useCallback(() => {
    const iso = buildIsoFromParts(day, month, year);
    onChange(iso);
    if (iso) {
      const parts = parseIsoDateParts(iso);
      setDay(parts.day);
      setMonth(parts.month);
      setYear(parts.year);
    }
    return iso;
  }, [day, month, onChange, year]);

  useImperativeHandle(ref, () => ({ commit }), [commit]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const form = container.closest("form");
    if (!form) return;

    const handleFormSubmit = () => {
      commit();
    };

    form.addEventListener("submit", handleFormSubmit);
    return () => form.removeEventListener("submit", handleFormSubmit);
  }, [commit]);

  const sync = (nextDay: string, nextMonth: string, nextYear: string) => {
    setDay(nextDay);
    setMonth(nextMonth);
    setYear(nextYear);

    if (!nextDay.trim() && !nextMonth.trim() && !nextYear.trim()) {
      onChange("");
      return;
    }

    const iso = buildIsoFromParts(nextDay, nextMonth, nextYear);
    if (iso) {
      onChange(iso);
    }
  };

  const inputClassName = cn(defaultInputClassName, className);

  const fields = (
    <div ref={containerRef} className="grid grid-cols-3 gap-2">
      <div className="min-w-0">
        <label htmlFor={id ? `${id}-day` : undefined} className="mb-1 block text-xs text-muted">
          {t("common.dateDay")}
        </label>
        <input
          id={id ? `${id}-day` : undefined}
          type="text"
          inputMode="numeric"
          autoComplete="bday-day"
          placeholder="08"
          maxLength={2}
          value={day}
          disabled={disabled}
          required={required}
          className={inputClassName}
          onChange={(event) => sync(event.target.value.replace(/\D/g, "").slice(0, 2), month, year)}
          onBlur={commit}
        />
      </div>
      <div className="min-w-0">
        <label htmlFor={id ? `${id}-month` : undefined} className="mb-1 block text-xs text-muted">
          {t("common.dateMonth")}
        </label>
        <input
          id={id ? `${id}-month` : undefined}
          type="text"
          inputMode="numeric"
          autoComplete="bday-month"
          placeholder="10"
          maxLength={2}
          value={month}
          disabled={disabled}
          required={required}
          className={inputClassName}
          onChange={(event) => sync(day, event.target.value.replace(/\D/g, "").slice(0, 2), year)}
          onBlur={commit}
        />
      </div>
      <div className="min-w-0">
        <label htmlFor={id ? `${id}-year` : undefined} className="mb-1 block text-xs text-muted">
          {t("common.dateYear")}
        </label>
        <input
          id={id ? `${id}-year` : undefined}
          type="text"
          inputMode="numeric"
          autoComplete="bday-year"
          placeholder="1990"
          maxLength={4}
          value={year}
          disabled={disabled}
          required={required}
          className={inputClassName}
          onChange={(event) => sync(day, month, event.target.value.replace(/\D/g, "").slice(0, 4))}
          onBlur={commit}
        />
      </div>
    </div>
  );

  if (!label) {
    return fields;
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {fields}
    </div>
  );
});
