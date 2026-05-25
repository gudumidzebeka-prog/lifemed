"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { normalizeDateOfBirth } from "@/lib/health/profile-dates";

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
    allergies: profile.allergies.join(", "),
  });

  useEffect(() => {
    if (open) {
      setForm({
        fullName: profile.fullName,
        dateOfBirth: normalizeDateOfBirth(profile.dateOfBirth),
        allergies: profile.allergies.join(", "),
      });
      setError(null);
    }
  }, [open, profile]);

  const parseList = (value: string) =>
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setSaving(true);
    setError(null);

    const updates: {
      fullName: string;
      allergies: string[];
      dateOfBirth?: string;
    } = {
      fullName: form.fullName.trim(),
      allergies: parseList(form.allergies),
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
          label={t("modals.profileAllergies")}
          placeholder={t("modals.profileAllergiesPlaceholder")}
          value={form.allergies}
          onChange={(e) => setForm({ ...form, allergies: e.target.value })}
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
