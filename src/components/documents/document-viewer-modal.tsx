"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers/locale-provider";
import { isImageMime, isPreviewableMime } from "@/lib/health/mime";
import type { HealthDocument } from "@/types/health";
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react";

interface DocumentViewerModalProps {
  document: HealthDocument | null;
  open: boolean;
  onClose: () => void;
  resolveUrl: (doc: HealthDocument) => Promise<{ url: string | null; error: string | null }>;
  onDownload: (doc: HealthDocument) => Promise<{ error: string | null }>;
}

export function DocumentViewerModal({
  document: doc,
  open,
  onClose,
  resolveUrl,
  onDownload,
}: DocumentViewerModalProps) {
  const { t } = useTranslation();
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open || !doc) {
      setUrl(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setUrl(null);

    resolveUrl(doc)
      .then(({ url: resolvedUrl, error: resolveError }) => {
        if (cancelled) return;
        if (resolveError || !resolvedUrl) {
          setError(resolveError ?? t("documents.openFailed"));
          return;
        }
        setUrl(resolvedUrl);
      })
      .catch(() => {
        if (!cancelled) setError(t("documents.openFailed"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, doc, resolveUrl, t]);

  const handleDownload = async () => {
    if (!doc) return;
    setDownloading(true);
    const { error: downloadError } = await onDownload(doc);
    setDownloading(false);
    if (downloadError) setError(downloadError);
  };

  const handleOpenExternal = () => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const previewable = doc ? isPreviewableMime(doc.fileType) : false;
  const isImage = doc ? isImageMime(doc.fileType) : false;
  const isPdf = doc?.fileType === "application/pdf";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={doc?.name ?? t("documents.title")}
      className="max-w-4xl"
    >
      <div className="space-y-4">
        {loading && (
          <div className="flex min-h-[240px] items-center justify-center text-muted">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t("common.loading")}
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </div>
        )}

        {!loading && url && doc && previewable && (
          <div className="overflow-hidden rounded-xl border border-border bg-black/5 dark:bg-black/20">
            {isImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt={doc.name}
                className="mx-auto max-h-[70vh] w-full object-contain"
              />
            )}
            {isPdf && (
              <iframe
                src={url}
                title={doc.name}
                className="h-[70vh] w-full bg-white"
              />
            )}
          </div>
        )}

        {!loading && url && doc && !previewable && (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-8 text-center">
            <FileText className="h-12 w-12 text-lifemed-500" />
            <p className="text-sm text-muted">{t("documents.previewUnavailable")}</p>
          </div>
        )}

        {doc && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="relative z-10"
              disabled={!url || downloading}
              onClick={handleDownload}
            >
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {t("documents.download")}
            </Button>
            {url && (
              <Button type="button" className="relative z-10" onClick={handleOpenExternal}>
                <ExternalLink className="h-4 w-4" />
                {t("documents.openExternal")}
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
