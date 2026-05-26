"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import { Select } from "@/components/ui/select";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import type { FamilyMember } from "@/types/health";

interface AddFamilyMemberModalProps {
  open: boolean;
  onClose: () => void;
  member?: FamilyMember | null;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AddFamilyMemberModal({ open, onClose, member = null }: AddFamilyMemberModalProps) {
  const { t } = useTranslation();
  const {
    addFamilyMember,
    editFamilyMember,
    uploadFamilyMemberAvatar,
    removeFamilyMemberAvatar,
    resolveAvatarUrl,
  } = useHealthDataContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
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

    setPhotoFile(null);
    setRemovePhoto(false);
    setError(null);

    let cancelled = false;

    const loadPhoto = async () => {
      if (!member?.avatarUrl) {
        setPhotoPreview(null);
        return;
      }

      if (member.avatarUrl.startsWith("blob:") || member.avatarUrl.startsWith("data:")) {
        setPhotoPreview(member.avatarUrl);
        return;
      }

      const { url } = await resolveAvatarUrl(member.avatarUrl);
      if (!cancelled) setPhotoPreview(url);
    };

    void loadPhoto();

    return () => {
      cancelled = true;
    };
  }, [open, member, resolveAvatarUrl]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t("profile.photoInvalidType"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("profile.photoTooLarge"));
      return;
    }

    setError(null);
    setPhotoFile(file);
    setRemovePhoto(false);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemovePhoto(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      relationship: form.relationship,
      dateOfBirth: form.dateOfBirth,
    };

    let memberId = member?.id ?? null;

    if (isEditing && member) {
      const { error: err } = await editFamilyMember(member.id, payload);
      if (err) {
        setLoading(false);
        setError(err);
        return;
      }
    } else {
      const { error: err, member: created } = await addFamilyMember(payload);
      if (err) {
        setLoading(false);
        setError(err);
        return;
      }
      memberId = created?.id ?? null;
    }

    if (memberId && photoFile) {
      const { error: uploadError } = await uploadFamilyMemberAvatar(memberId, photoFile);
      if (uploadError) {
        setLoading(false);
        setError(uploadError);
        return;
      }
    } else if (memberId && removePhoto && member?.avatarUrl) {
      const { error: removeError } = await removeFamilyMemberAvatar(memberId);
      if (removeError) {
        setLoading(false);
        setError(removeError);
        return;
      }
    }

    setLoading(false);
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

        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-lifemed-50 text-xl font-bold text-lifemed-700 dark:bg-lifemed-950/50 dark:text-lifemed-300">
              {photoPreview ? (
                <Image src={photoPreview} alt={form.name || t("modals.familyName")} fill className="object-cover" unoptimized />
              ) : (
                getInitials(form.name)
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => inputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-lifemed-500 text-white shadow-md transition-transform hover:scale-105 disabled:opacity-60"
              aria-label={t("profile.changePhoto")}
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          {(photoPreview || member?.avatarUrl) && !removePhoto ? (
            <Button type="button" variant="ghost" size="sm" disabled={loading} onClick={handleRemovePhoto}>
              <Trash2 className="h-4 w-4" />
              {t("profile.removePhoto")}
            </Button>
          ) : null}

          {loading ? <p className="text-xs text-muted">{t("profile.photoUploading")}</p> : null}
        </div>

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

        <DateInput
          label={t("modals.familyDob")}
          value={form.dateOfBirth}
          onChange={(dateOfBirth) => setForm({ ...form, dateOfBirth })}
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
