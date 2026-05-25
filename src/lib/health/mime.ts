const EXTENSION_MIME: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  gif: "image/gif",
};

export function inferMimeType(name: string, type?: string) {
  const trimmed = type?.trim();
  if (trimmed) return trimmed;

  const ext = name.split(".").pop()?.toLowerCase();
  if (ext && EXTENSION_MIME[ext]) return EXTENSION_MIME[ext];

  return "application/octet-stream";
}

export function isPreviewableMime(mime: string) {
  return mime.startsWith("image/") || mime === "application/pdf";
}

export function isImageMime(mime: string) {
  return mime.startsWith("image/");
}
