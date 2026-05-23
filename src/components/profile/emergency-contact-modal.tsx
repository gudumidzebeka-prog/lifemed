"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";

interface EmergencyContactModalProps {
  open: boolean;
  onClose: () => void;
}

export function EmergencyContactModal({ open, onClose }: EmergencyContactModalProps) {
  const { t } = useTranslation();
  const { addEmergencyContact } = useHealthDataContext();
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setRelationship("");
    setPhone("");
    setEmail("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setLoading(true);
    setError(null);

    const { error: err } = await addEmergencyContact({
      name: name.trim(),
      relationship: relationship.trim() || "Contact",
      phone: phone.trim(),
      email: email.trim() || undefined,
    });

    setLoading(false);
    if (err) {
      setError(err);
      return;
    }

    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t("modals.contactAddTitle")}>
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
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? t("common.saving") : t("common.add")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}