"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddTimelineEventModal } from "@/components/timeline/add-event-modal";
import { EditTimelineEventModal } from "@/components/timeline/edit-event-modal";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { useTimelineTypeLabel } from "@/lib/i18n/hooks";
import { getTimelineTypeColor } from "@/data/demo-data";
import { formatDate } from "@/lib/utils";
import { Plus, Filter, Search, Trash2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { TimelineEvent, TimelineEventType } from "@/types/health";
import { TIMELINE_EVENT_TYPES } from "@/lib/constants";

export default function TimelinePage() {
  const { t } = useTranslation();

  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">{t("common.loading")}</div>}>
      <TimelineContent />
    </Suspense>
  );
}

function TimelineContent() {
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();
  const getTimelineTypeLabel = useTimelineTypeLabel();
  const { loading, timeline, removeTimelineEvent } = useHealthDataContext();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TimelineEventType | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEvent, setEditEvent] = useState<TimelineEvent | null>(null);

  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setShowAddModal(true);
    }
  }, [searchParams]);

  const filtered = timeline
    .filter((event) => {
      if (filter !== "all" && event.type !== filter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        event.title.toLowerCase().includes(q) ||
        event.description?.toLowerCase().includes(q) ||
        event.provider?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const groupedByYear = filtered.reduce<Record<string, typeof filtered>>((acc, event) => {
    const year = new Date(event.date).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(event);
    return acc;
  }, {});

  const years = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="space-y-8">
      {loading && <div className="text-center text-muted py-8">{t("common.loading")}</div>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("timeline.title")}</h1>
          <p className="mt-1 text-muted">{t("timeline.subtitle")}</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4" />
          {t("timeline.addEvent")}
        </Button>
      </div>

      <AddTimelineEventModal open={showAddModal} onClose={() => setShowAddModal(false)} />
      <EditTimelineEventModal
        open={!!editEvent}
        onClose={() => setEditEvent(null)}
        event={editEvent}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder={t("timeline.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
            {t("common.all")}
          </FilterButton>
          {TIMELINE_EVENT_TYPES.slice(0, 6).map((type) => (
            <FilterButton key={type} active={filter === type} onClick={() => setFilter(type)}>
              {getTimelineTypeLabel(type)}
            </FilterButton>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border hidden sm:block" />

        {years.map((year) => (
          <div key={year} className="mb-10">
            <div className="sticky top-16 z-10 mb-6 flex items-center gap-4 bg-background/80 py-2 backdrop-blur-sm">
              <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-lifemed-500 text-sm font-bold text-white shadow-md shadow-lifemed-500/30">
                {year.slice(2)}
              </div>
              <h2 className="text-xl font-bold text-foreground">{year}</h2>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-4 sm:pl-14">
              {groupedByYear[year].map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="card-hover">
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setEditEvent(event)}
                          className="relative z-10 min-w-0 flex-1 text-left"
                          aria-label={t("timeline.edit")}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{event.title}</h3>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTimelineTypeColor(event.type)}`}
                            >
                              {getTimelineTypeLabel(event.type)}
                            </span>
                          </div>
                          {event.description && (
                            <p className="mt-2 text-sm text-muted leading-relaxed">
                              {event.description}
                            </p>
                          )}
                          {event.provider && (
                            <p className="mt-2 text-xs text-muted">
                              {t("common.provider")} {event.provider}
                            </p>
                          )}
                        </button>
                        <div className="flex items-start gap-1 shrink-0">
                          <time className="text-sm font-medium text-lifemed-600 dark:text-lifemed-400">
                            {formatDate(event.date, locale, { month: "long", day: "numeric" })}
                          </time>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="relative z-10 h-8 w-8"
                            onClick={() => setEditEvent(event)}
                            aria-label={t("timeline.edit")}
                          >
                            <Pencil className="h-4 w-4 text-muted" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="relative z-10 h-8 w-8"
                            onClick={() => removeTimelineEvent(event.id)}
                            aria-label={t("timeline.delete")}
                          >
                            <Trash2 className="h-4 w-4 text-muted" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Filter className="mx-auto h-12 w-12 text-muted/40" />
            <p className="mt-4 text-muted">{t("timeline.emptySearch")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-lifemed-500 text-white"
          : "bg-surface-elevated text-muted hover:text-foreground border border-border"
      }`}
    >
      {children}
    </button>
  );
}
