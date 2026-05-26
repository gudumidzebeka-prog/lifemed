"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { normalizeDateOfBirth } from "@/lib/health/profile-dates";
import { isProfileGender, profileGenderOptions, type ProfileGender } from "@/lib/health/profile-gender";
import { cn } from "@/lib/utils";

function ProfileFieldRow({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 px-4 py-2.5 sm:flex-row sm:items-center sm:gap-6">
      <label
        htmlFor={htmlFor}
        className="text-sm text-muted sm:w-36 lg:w-44 shrink-0"
      >
        {label}
      </label>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

const fieldClassName =
  "flex h-9 w-full rounded-lg border border-border bg-field px-3 text-sm dark:bg-surface placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lifemed-400 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200";

export function ProfileEditSection() {
  const { t } = useTranslation();
  const { profile, saveProfile, loading } = useHealthDataContext();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: profile.fullName,
    dateOfBirth: normalizeDateOfBirth(profile.dateOfBirth),
    city: profile.city ?? "",
    gender: profile.gender ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
  });

  const genderOptions = [
    { value: "", label: t("modals.profileGenderPlaceholder") },
    ...profileGenderOptions(t),
  ];

  useEffect(() => {
    setForm({
      fullName: profile.fullName,
      dateOfBirth: normalizeDateOfBirth(profile.dateOfBirth),
      city: profile.city ?? "",
      gender: profile.gender ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
    });
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setSaving(true);
    setError(null);

    const selectedGender = isProfileGender(form.gender) ? form.gender : undefined;

    const updates: {
      fullName: string;
      email: string;
      phone: string;
      city: string;
      gender?: ProfileGender;
      dateOfBirth?: string;
    } = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      gender: selectedGender,
    };

    if (form.dateOfBirth) {
      updates.dateOfBirth = normalizeDateOfBirth(form.dateOfBirth);
    }

    const { error: err } = await saveProfile(updates);

    setSaving(false);
    if (err) {
      setError(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="divide-y divide-border">
        <ProfileFieldRow label={t("modals.profileFullName")} htmlFor="profile-full-name">
          <input
            id="profile-full-name"
            className={fieldClassName}
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
        </ProfileFieldRow>

        <ProfileFieldRow label={t("modals.profileDob")} htmlFor="profile-dob">
          <input
            id="profile-dob"
            type="date"
            className={fieldClassName}
            value={form.dateOfBirth}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
          />
        </ProfileFieldRow>

        <ProfileFieldRow label={t("modals.profileCity")} htmlFor="profile-city">
          <input
            id="profile-city"
            className={fieldClassName}
            placeholder={t("modals.profileCityPlaceholder")}
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </ProfileFieldRow>

        <ProfileFieldRow label={t("modals.profileGender")} htmlFor="profile-gender">
          <select
            id="profile-gender"
            className={cn(fieldClassName, "cursor-pointer")}
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value as ProfileGender | "" })}
          >
            {genderOptions.map((opt) => (
              <option key={opt.value || "empty"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </ProfileFieldRow>

        <ProfileFieldRow label={t("modals.profileEmail")} htmlFor="profile-email">
          <input
            id="profile-email"
            type="email"
            className={fieldClassName}
            placeholder={t("modals.profileEmailPlaceholder")}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </ProfileFieldRow>

        <ProfileFieldRow label={t("modals.profilePhone")} htmlFor="profile-phone">
          <input
            id="profile-phone"
            type="tel"
            className={fieldClassName}
            placeholder={t("modals.profilePhonePlaceholder")}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </ProfileFieldRow>
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        {error ? <p className="text-sm text-rose-600">{error}</p> : <span className="hidden sm:block" />}
        <Button type="submit" size="sm" className="sm:ml-auto" disabled={saving || loading}>
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </div>
    </form>
  );
}
