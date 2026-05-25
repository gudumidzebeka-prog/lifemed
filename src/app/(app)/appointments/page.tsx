"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddAppointmentModal } from "@/components/appointments/add-appointment-modal";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { formatDate } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";
import type { Appointment } from "@/types/health";
import { Calendar, Plus, Trash2, MapPin, Pencil } from "lucide-react";

export default function AppointmentsPage() {
  const { t } = useTranslation();

  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">{t("common.loading")}</div>}>
      <AppointmentsContent />
    </Suspense>
  );
}

function AppointmentsContent() {
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();
  const { loading, appointments, removeAppointment } = useHealthDataContext();
  const [showModal, setShowModal] = useState(false);
  const [editAppointment, setEditAppointment] = useState<Appointment | null>(null);

  const openAppointmentModal = (appointment: Appointment | null = null) => {
    setEditAppointment(appointment);
    setShowModal(true);
  };

  const closeAppointmentModal = () => {
    setShowModal(false);
    setEditAppointment(null);
  };

  useEffect(() => {
    if (searchParams.get("add") === "true") {
      openAppointmentModal(null);
    }
  }, [searchParams]);

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("appointments.title")}</h1>
          <p className="mt-1 text-muted">{t("appointments.subtitle")}</p>
        </div>
        <Button onClick={() => openAppointmentModal(null)}>
          <Plus className="h-4 w-4" />
          {t("appointments.add")}
        </Button>
      </div>

      <AddAppointmentModal
        open={showModal}
        onClose={closeAppointmentModal}
        appointment={editAppointment}
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-lifemed-500" />
          {t("appointments.upcoming")}
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted">{t("appointments.empty")}</p>
        ) : (
          upcoming.map((apt) => (
            <AppointmentCard
              key={apt.id}
              apt={apt}
              locale={locale}
              onEdit={() => openAppointmentModal(apt)}
              onRemove={() => removeAppointment(apt.id)}
            />
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
              onEdit={() => openAppointmentModal(apt)}
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
  onEdit,
  onRemove,
  muted,
}: {
  apt: Appointment;
  locale: Locale;
  onEdit: () => void;
  onRemove: () => void;
  muted?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Card className={muted ? "opacity-70" : "card-hover"}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <button
          type="button"
          onClick={onEdit}
          className="relative z-10 min-w-0 flex-1 text-left"
          aria-label={t("common.edit")}
        >
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
        </button>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="relative z-10"
            onClick={onEdit}
            aria-label={t("common.edit")}
          >
            <Pencil className="h-4 w-4 text-muted" />
          </Button>
          <Button variant="ghost" size="icon" className="relative z-10" onClick={onRemove}>
            <Trash2 className="h-4 w-4 text-muted" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}