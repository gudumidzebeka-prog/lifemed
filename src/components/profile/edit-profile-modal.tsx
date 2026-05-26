"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { normalizeDateOfBirth } from "@/lib/health/profile-dates";
import { isProfileGender, profileGenderOptions, type ProfileGender } from "@/lib/health/profile-gender";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function EditProfileModal({ open, onClose }: EditProfileModalProps) {
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
  const wasOpenRef = useRef(false);

  const genderOptions = [
    { value: "", label: t("modals.profileGenderPlaceholder") },
    ...profileGenderOptions(t),
  ];

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setForm({
        fullName: profile.fullName,
        dateOfBirth: normalizeDateOfBirth(profile.dateOfBirth),
        city: profile.city ?? "",
        gender: profile.gender ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
      });
      setError(null);
    }
    wasOpenRef.current = open;
  }, [open, profile]);

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
      return;
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t("modals.profileEditTitle")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-rose-600">{error}</p>}

        <Input
          label={t("modals.profileFullName")}
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          required
        />
        <Input
          label={t("modals.profileDob")}
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
        />
        <Input
          label={t("modals.profileCity")}
          placeholder={t("modals.profileCityPlaceholder")}
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <Select
          label={t("modals.profileGender")}
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value as ProfileGender | "" })}
          options={genderOptions}
        />
        <Input
          label={t("modals.profileEmail")}
          type="email"
          placeholder={t("modals.profileEmailPlaceholder")}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label={t("modals.profilePhone")}
          type="tel"
          placeholder={t("modals.profilePhonePlaceholder")}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" className="flex-1" disabled={saving || loading}>
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
