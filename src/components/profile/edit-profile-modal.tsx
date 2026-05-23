"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const { t } = useTranslation();
  const { profile, saveProfile } = useHealthDataContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: profile.fullName,
    dateOfBirth: profile.dateOfBirth,
    bloodType: profile.bloodType ?? "",
    allergies: profile.allergies.join(", "),
    chronicIllnesses: profile.chronicIllnesses.join(", "),
  });

  useEffect(() => {
    if (open) {
      setForm({
        fullName: profile.fullName,
        dateOfBirth: profile.dateOfBirth,
        bloodType: profile.bloodType ?? "",
        allergies: profile.allergies.join(", "),
        chronicIllnesses: profile.chronicIllnesses.join(", "),
      });
    }
  }, [open, profile]);

  const parseList = (value: string) =>
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: err } = await saveProfile({
      fullName: form.fullName,
      dateOfBirth: form.dateOfBirth,
      bloodType: form.bloodType || undefined,
      allergies: parseList(form.allergies),
      chronicIllnesses: parseList(form.chronicIllnesses),
    });

    setLoading(false);
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
          label={t("modals.profileBloodType")}
          placeholder={t("modals.profileBloodTypePlaceholder")}
          value={form.bloodType}
          onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
        />
        <Input
          label={t("modals.profileAllergies")}
          placeholder={t("modals.profileAllergiesPlaceholder")}
          value={form.allergies}
          onChange={(e) => setForm({ ...form, allergies: e.target.value })}
        />
        <Input
          label={t("modals.profileChronic")}
          placeholder={t("modals.profileChronicPlaceholder")}
          value={form.chronicIllnesses}
          onChange={(e) => setForm({ ...form, chronicIllnesses: e.target.value })}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
