"use client";

import { useRef, useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { useDocumentCategoryLabel } from "@/lib/i18n/hooks";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import { Upload, FileText } from "lucide-react";

interface UploadDocumentModalProps {
  open: boolean;
  onClose: () => void;
  initialFile?: File | null;
}

export function UploadDocumentModal({ open, onClose, initialFile = null }: UploadDocumentModalProps) {
  const { t } = useTranslation();
  const getDocumentCategoryLabel = useDocumentCategoryLabel();
  const { uploadDocument } = useHealthDataContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>(DOCUMENT_CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setFile(initialFile ?? null);
  }, [open, initialFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const { error: err } = await uploadDocument(file, category);
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    setFile(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t("modals.docUploadTitle")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div
          className="rounded-2xl border-2 border-dashed border-border p-8 text-center cursor-pointer hover:border-lifemed-300 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="flex items-center justify-center gap-2 text-foreground">
              <FileText className="h-5 w-5 text-lifemed-500" />
              <span className="text-sm font-medium truncate max-w-[240px]">{file.name}</span>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-8 w-8 text-lifemed-400" />
              <p className="mt-2 text-sm text-muted">{t("modals.docPickFile")}</p>
            </>
          )}
        </div>

        <Select
          label={t("modals.docCategory")}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={DOCUMENT_CATEGORIES.map((c) => ({
            value: c,
            label: getDocumentCategoryLabel(c),
          }))}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" className="flex-1" disabled={!file || loading}>
            {loading ? t("common.loading") : t("common.upload")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
