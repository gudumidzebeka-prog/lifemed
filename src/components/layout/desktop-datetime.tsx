"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import { formatDayFirstDate } from "@/lib/dates";

function formatDesktopDate(date: Date) {
  return formatDayFirstDate(date);
}

function formatDesktopTime(date: Date) {
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function DesktopDateTime({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());

    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  if (!now) return null;

  return (
    <time
      dateTime={now.toISOString()}
      className={cn(
        "inline-flex items-baseline text-base font-semibold tabular-nums text-foreground",
        className
      )}
    >
      <span>{formatDesktopDate(now)}</span>
      <span className="ml-[2cm]">{formatDesktopTime(now)}</span>
    </time>
  );
}
