"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { Plus, X } from "lucide-react";

interface AllergyManageModalProps {
  open: boolean;
  onClose: () => void;
}

export function AllergyManageModal({ open, onClose }: AllergyManageModalProps) {
  const { t } = useTranslation();
  const { profile, addAllergy, removeAllergy } = useHealthDataContext();
  const [newAllergy, setNewAllergy] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newAllergy.trim()) return;

    setSaving(true);
    setError(null);
    const { error: err } = await addAllergy(newAllergy.trim());
    setSaving(false);

    if (err) {
      setError(err);
      return;
    }

    setNewAllergy("");
  };

  return (
    <Modal open={open} onClose={onClose} title={t("profile.allergies")}>
      <div className="space-y-4">
        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex flex-wrap gap-2">
          {profile.allergies.length === 0 ? (
            <p className="text-sm text-muted">{t("emergency.noAllergies")}</p>
          ) : (
            profile.allergies.map((allergy) => (
              <Badge key={allergy} variant="danger" className="gap-1 pr-1">
                {allergy}
                <button
                  type="button"
                  onClick={() => removeAllergy(allergy)}
                  className="relative z-10 ml-1 rounded-full p-0.5 hover:bg-rose-200/50"
                  aria-label={`${t("common.remove")} ${allergy}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder={t("profile.newAllergyPlaceholder")}
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button
            type="button"
            size="sm"
            className="relative z-10 shrink-0"
            onClick={handleAdd}
            disabled={saving}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button type="button" variant="secondary" className="w-full" onClick={onClose}>
          {t("common.cancel")}
        </Button>
      </div>
    </Modal>
  );
}
