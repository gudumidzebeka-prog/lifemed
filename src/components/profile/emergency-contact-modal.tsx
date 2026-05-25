"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import type { EmergencyContact } from "@/types/health";

interface EmergencyContactModalProps {
  open: boolean;
  onClose: () => void;
  contact?: EmergencyContact | null;
}

export function EmergencyContactModal({ open, onClose, contact }: EmergencyContactModalProps) {
  const { t } = useTranslation();
  const { addEmergencyContact, editEmergencyContact } = useHealthDataContext();
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(contact);

  useEffect(() => {
    if (!open) return;

    if (contact) {
      setName(contact.name);
      setRelationship(contact.relationship);
      setPhone(contact.phone);
      setEmail(contact.email ?? "");
    } else {
      setName("");
      setRelationship("");
      setPhone("");
      setEmail("");
    }
    setError(null);
  }, [open, contact]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      relationship: relationship.trim() || "Contact",
      phone: phone.trim(),
      email: email.trim() || undefined,
    };

    const { error: err } = isEditing && contact
      ? await editEmergencyContact(contact.id, payload)
      : await addEmergencyContact(payload);

    setLoading(false);
    if (err) {
      setError(err);
      return;
    }

    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? t("modals.contactEditTitle") : t("modals.contactAddTitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <Input label={t("modals.contactName")} value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          label={t("modals.contactRelationship")}
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          placeholder={t("modals.contactRelationshipPlaceholder")}
        />
        <Input label={t("modals.contactPhone")} value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <Input
          label={t("modals.contactEmail")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
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
