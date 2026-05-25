"use client";

import { useState, useCallback, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { useDocumentCategoryLabel } from "@/lib/i18n/hooks";
import { isImageMime } from "@/lib/health/mime";
import { formatRelativeTime } from "@/lib/utils";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import { UploadDocumentModal } from "@/components/documents/upload-document-modal";
import { DocumentViewerModal } from "@/components/documents/document-viewer-modal";
import type { HealthDocument } from "@/types/health";
import {
  Upload,
  Search,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  Grid,
  List,
  X,
  Download,
  Trash2,
  Eye,
} from "lucide-react";

function DocumentsContent() {
  const { t, locale } = useTranslation();
  const getDocumentCategoryLabel = useDocumentCategoryLabel();
  const searchParams = useSearchParams();
  const { loading, documents, downloadDocument, resolveDocumentUrl, removeDocument } =
    useHealthDataContext();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [viewerDoc, setViewerDoc] = useState<HealthDocument | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("upload") === "true") {
      setShowUploadModal(true);
    }
  }, [searchParams]);

  const folders = useMemo(() => {
    const years = new Set<string>();
    documents.forEach((doc) => {
      years.add(new Date(doc.uploadedAt).getFullYear().toString());
    });
    return ["all", ...Array.from(years).sort((a, b) => Number(b) - Number(a))];
  }, [documents]);

  const filtered = documents.filter((doc) => {
    if (selectedCategory !== "all" && doc.category !== selectedCategory) return false;
    if (selectedFolder !== "all") {
      const year = new Date(doc.uploadedAt).getFullYear().toString();
      if (year !== selectedFolder) return false;
    }
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      doc.name.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q) ||
      doc.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setDroppedFile(file);
      setShowUploadModal(true);
    }
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setDroppedFile(null);
  };

  const openDocument = (doc: HealthDocument) => {
    setActionError(null);
    setViewerDoc(doc);
  };

  const handleDownload = async (doc: HealthDocument) => {
    setActionError(null);
    const { error } = await downloadDocument(doc);
    if (error) setActionError(error);
  };

  const getThumbnailUrl = (doc: HealthDocument) => {
    if (doc.fileUrl.startsWith("blob:") && isImageMime(doc.fileType)) {
      return doc.fileUrl;
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {loading && <div className="text-center text-muted py-4">{t("common.loading")}</div>}

      {actionError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
          {actionError}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("documents.title")}</h1>
          <p className="mt-1 text-muted">{t("documents.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="icon" onClick={() => setView(view === "grid" ? "list" : "grid")}>
            {view === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4" />
            {t("documents.upload")}
          </Button>
        </div>
      </div>

      <UploadDocumentModal open={showUploadModal} onClose={closeUploadModal} initialFile={droppedFile} />
      <DocumentViewerModal
        open={Boolean(viewerDoc)}
        document={viewerDoc}
        onClose={() => setViewerDoc(null)}
        resolveUrl={resolveDocumentUrl}
        onDownload={downloadDocument}
      />

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          dragActive
            ? "drop-zone-active border-lifemed-400 scale-[1.01]"
            : "border-border hover:border-lifemed-300"
        }`}
      >
        <Upload className="mx-auto h-10 w-10 text-lifemed-400" />
        <p className="mt-3 font-medium text-foreground">{t("documents.dropTitle")}</p>
        <p className="mt-1 text-sm text-muted">{t("documents.dropSubtitle")}</p>
        <Button variant="secondary" className="mt-4" size="sm" onClick={() => setShowUploadModal(true)}>
          {t("documents.browse")}
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder={t("documents.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <CategoryChip
            label={t("common.all")}
            active={selectedCategory === "all"}
            onClick={() => setSelectedCategory("all")}
          />
          {DOCUMENT_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={getDocumentCategoryLabel(cat)}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? "all" : cat)}
              clearable={selectedCategory === cat}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {folders.map((folder) => (
          <button
            key={folder}
            type="button"
            onClick={() => setSelectedFolder(folder)}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
              selectedFolder === folder
                ? "border-lifemed-400 bg-lifemed-50 dark:bg-lifemed-950/30 text-lifemed-700 dark:text-lifemed-300"
                : "border-border bg-surface hover:bg-surface-elevated hover:border-lifemed-300"
            }`}
          >
            <FolderOpen className="h-4 w-4 text-lifemed-500" />
            {folder === "all" ? t("documents.folderAll") : folder}
          </button>
        ))}
      </div>

      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc, i) => {
            const thumb = getThumbnailUrl(doc);
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="card-hover group overflow-hidden">
                  <CardContent className="p-0">
                    <button
                      type="button"
                      onClick={() => openDocument(doc)}
                      className="relative z-10 block w-full p-5 text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-lifemed-50 text-lifemed-600 dark:bg-lifemed-950/50">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={thumb} alt={doc.name} className="h-full w-full object-cover" />
                          ) : isImageMime(doc.fileType) ? (
                            <ImageIcon className="h-6 w-6" />
                          ) : (
                            <FileText className="h-6 w-6" />
                          )}
                        </div>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="relative z-10 h-8 w-8"
                            aria-label={t("documents.view")}
                            onClick={() => openDocument(doc)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="relative z-10 h-8 w-8"
                            aria-label={t("documents.download")}
                            onClick={() => handleDownload(doc)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="relative z-10 h-8 w-8"
                            onClick={() => removeDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="mt-4 font-medium text-foreground truncate group-hover:text-lifemed-600 transition-colors">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-muted mt-1">{getDocumentCategoryLabel(doc.category)}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted">
                        <span>{formatSize(doc.fileSize)}</span>
                        <span>{formatRelativeTime(doc.uploadedAt, locale)}</span>
                      </div>
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((doc) => (
            <Card key={doc.id} className="card-hover">
              <CardContent className="flex items-center gap-4 p-4">
                <button
                  type="button"
                  onClick={() => openDocument(doc)}
                  className="relative z-10 flex min-w-0 flex-1 items-center gap-4 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-lifemed-50 text-lifemed-600">
                    {getThumbnailUrl(doc) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getThumbnailUrl(doc)!} alt={doc.name} className="h-full w-full object-cover" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{doc.name}</p>
                    <p className="text-xs text-muted">
                      {getDocumentCategoryLabel(doc.category)} · {formatSize(doc.fileSize)} ·{" "}
                      {formatRelativeTime(doc.uploadedAt, locale)}
                    </p>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative z-10"
                  aria-label={t("documents.view")}
                  onClick={() => openDocument(doc)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative z-10"
                  aria-label={t("documents.download")}
                  onClick={() => handleDownload(doc)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="relative z-10" onClick={() => removeDocument(doc.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted/40" />
          <p className="mt-4 text-muted">{t("documents.empty")}</p>
        </div>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  const { t } = useTranslation();

  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">{t("common.loading")}</div>}>
      <DocumentsContent />
    </Suspense>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
  clearable,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  clearable?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 ${
        active
          ? "bg-lifemed-500 text-white"
          : "bg-surface-elevated text-muted hover:text-foreground border border-border"
      }`}
    >
      {label}
      {clearable && label !== t("common.all") && <X className="h-3 w-3" />}
    </button>
  );
}
