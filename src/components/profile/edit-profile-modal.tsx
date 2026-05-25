"use client";

import { useEffect, useRef, useState } from "react";
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
    email: profile.email ?? "",
    phone: profile.phone ?? "",
  });
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setForm({
        fullName: profile.fullName,
        dateOfBirth: normalizeDateOfBirth(profile.dateOfBirth),
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

    const updates: {
      fullName: string;
      email: string;
      phone: string;
      dateOfBirth?: string;
    } = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
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
