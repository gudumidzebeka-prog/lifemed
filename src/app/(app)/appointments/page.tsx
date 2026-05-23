"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataModeBanner } from "@/components/layout/data-mode-banner";
import { AddAppointmentModal } from "@/components/appointments/add-appointment-modal";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { formatDate } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";
import { Calendar, Plus, Trash2, MapPin } from "lucide-react";

export default function AppointmentsPage() {
  const { t, locale } = useTranslation();
  const { mode, loading, appointments, removeAppointment } = useHealthDataContext();
  const [showModal, setShowModal] = useState(false);

  const upcoming = appointments
    .filter((a) => new Date(a.date) >= new Date())
    .sort((a, b) => a.date.localeCompare(b.date));

  const past = appointments
    .filter((a) => new Date(a.date) < new Date())
    .sort((a, b) => b.date.localeCompare(a.date));

  if (loading) {
    return <div className="py-20 text-center text-muted">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-8">
      <DataModeBanner mode={mode} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("appointments.title")}</h1>
          <p className="mt-1 text-muted">{t("appointments.subtitle")}</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          {t("appointments.add")}
        </Button>
      </div>

      <AddAppointmentModal open={showModal} onClose={() => setShowModal(false)} />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-lifemed-500" />
          {t("appointments.upcoming")}
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted">{t("appointments.empty")}</p>
        ) : (
          upcoming.map((apt) => (
            <AppointmentCard key={apt.id} apt={apt} locale={locale} onRemove={() => removeAppointment(apt.id)} />
          ))
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-muted">{t("appointments.past")}</h2>
          {past.map((apt) => (
            <AppointmentCard
              key={apt.id}
              apt={apt}
              locale={locale}
              onRemove={() => removeAppointment(apt.id)}
              muted
            />
          ))}
        </section>
      )}
    </div>
  );
}

function AppointmentCard({
  apt,
  locale,
  onRemove,
  muted,
}: {
  apt: { id: string; title: string; provider: string; date: string; location?: string };
  locale: Locale;
  onRemove: () => void;
  muted?: boolean;
}) {
  return (
    <Card className={muted ? "opacity-70" : "card-hover"}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <h3 className="font-semibold text-foreground">{apt.title}</h3>
          <p className="text-sm text-muted mt-1">{apt.provider}</p>
          <p className="text-sm text-lifemed-600 dark:text-lifemed-400 mt-2">
            {formatDate(apt.date, locale, { weekday: "long", hour: "numeric", minute: "2-digit" })}
          </p>
          {apt.location && (
            <p className="text-xs text-muted mt-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {apt.location}
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="h-4 w-4 text-muted" />
        </Button>
      </CardContent>
    </Card>
  );
}