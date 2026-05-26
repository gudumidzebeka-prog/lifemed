"use client";

import { useEffect, useState } from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { formatIsoToDayFirstDisplay, parseDayFirstInputToIso } from "@/lib/dates";
import { cn } from "@/lib/utils";

type DateInputProps = Omit<InputProps, "type" | "value" | "onChange"> & {
  value: string;
  onChange: (isoDate: string) => void;
};

function useDateInputState(value: string, onChange: (isoDate: string) => void) {
  const [display, setDisplay] = useState(() => formatIsoToDayFirstDisplay(value));

  useEffect(() => {
    setDisplay(formatIsoToDayFirstDisplay(value));
  }, [value]);

  const commit = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      onChange("");
      setDisplay("");
      return;
    }

    const iso = parseDayFirstInputToIso(trimmed);
    if (iso) {
      onChange(iso);
      setDisplay(formatIsoToDayFirstDisplay(iso));
      return;
    }

    setDisplay(formatIsoToDayFirstDisplay(value));
  };

  return { display, setDisplay, commit };
}

export function DateInput({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  label,
  className,
  onBlur,
  onKeyDown,
  ...props
}: DateInputProps) {
  const { display, setDisplay, commit } = useDateInputState(value, onChange);

  const sharedProps = {
    type: "text" as const,
    inputMode: "numeric" as const,
    autoComplete: "bday" as const,
    placeholder,
    value: display,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => setDisplay(event.target.value),
    onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
      commit(event.target.value);
      onBlur?.(event);
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        commit((event.target as HTMLInputElement).value);
      }
      onKeyDown?.(event);
    },
  };

  if (label === undefined) {
    return (
      <input
        {...props}
        {...sharedProps}
        className={cn(
          "flex h-11 w-full rounded-xl border border-border bg-field px-4 py-2 text-sm dark:bg-surface",
          "placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lifemed-400 focus-visible:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          className
        )}
      />
    );
  }

  return <Input {...props} {...sharedProps} label={label} className={className} />;
}
