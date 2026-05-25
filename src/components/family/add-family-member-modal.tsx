"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import type { FamilyMember } from "@/types/health";

interface AddFamilyMemberModalProps {
  open: boolean;
  onClose: () => void;
  member?: FamilyMember | null;
}

export function AddFamilyMemberModal({ open, onClose, member = null }: AddFamilyMemberModalProps) {
  const { t } = useTranslation();
  const { addFamilyMember, editFamilyMember } = useHealthDataContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    relationship: "Child",
    dateOfBirth: "",
  });

  const isEditing = Boolean(member);

  const relationships = useMemo(
    () => [
      { value: "Child", label: t("modals.relChild") },
      { value: "Parent", label: t("modals.relParent") },
      { value: "Spouse", label: t("modals.relSpouse") },
      { value: "Sibling", label: t("modals.relSibling") },
      { value: "Grandparent", label: t("modals.relGrandparent") },
      { value: "Other", label: t("modals.relOther") },
    ],
    [t]
  );

  useEffect(() => {
    if (!open) return;

    if (member) {
      setForm({
        name: member.name,
        relationship: member.relationship,
        dateOfBirth: member.dateOfBirth?.slice(0, 10) ?? "",
      });
    } else {
      setForm({ name: "", relationship: "Child", dateOfBirth: "" });
    }

    setError(null);
  }, [open, member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      relationship: form.relationship,
      dateOfBirth: form.dateOfBirth,
    };

    const { error: err } = isEditing && member
      ? await editFamilyMember(member.id, payload)
      : await addFamilyMember(payload);

    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? t("modals.familyEditTitle") : t("modals.familyAddTitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-rose-600">{error}</p>}

        <Input
          label={t("modals.familyName")}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <Select
          label={t("modals.familyRelationship")}
          value={form.relationship}
          onChange={(e) => setForm({ ...form, relationship: e.target.value })}
          options={relationships}
        />

        <Input
          label={t("modals.familyDob")}
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? t("common.saving") : isEditing ? t("common.save") : t("common.add")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
