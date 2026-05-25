"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function formatDesktopDateTime(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${month}/${day}/${year} ${hours}:${minutes}`;
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
      className={cn("text-base font-semibold tabular-nums text-foreground", className)}
    >
      {formatDesktopDateTime(now)}
    </time>
  );
}
