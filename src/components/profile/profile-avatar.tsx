"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { displayFirstName } from "@/lib/health/empty-profile";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  fullName: string;
  avatarUrl?: string;
  size?: "md" | "lg";
  editable?: boolean;
  className?: string;
}

function getInitials(fullName: string) {
  return (fullName.trim() || displayFirstName(fullName))
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProfileAvatar({
  fullName,
  avatarUrl,
  size = "lg",
  editable = false,
  className,
}: ProfileAvatarProps) {
  const { t } = useTranslation();
  const { uploadProfileAvatar, removeProfileAvatar, resolveAvatarUrl } = useHealthDataContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizeClass = size === "lg" ? "h-24 w-24 text-3xl rounded-3xl" : "h-16 w-16 text-xl rounded-2xl";

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!avatarUrl) {
        setDisplayUrl(null);
        return;
      }

      if (avatarUrl.startsWith("blob:") || avatarUrl.startsWith("data:")) {
        setDisplayUrl(avatarUrl);
        return;
      }

      const { url } = await resolveAvatarUrl(avatarUrl);
      if (!cancelled) setDisplayUrl(url);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [avatarUrl, resolveAvatarUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setLoading(true);
    setError(null);

    const { error: uploadError } = await uploadProfileAvatar(file);
    setLoading(false);

    if (uploadError) {
      setError(uploadError);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    setError(null);
    const { error: removeError } = await removeProfileAvatar();
    setLoading(false);
    if (removeError) setError(removeError);
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative">
        <div
          className={cn(
            "relative flex items-center justify-center overflow-hidden gradient-primary font-bold text-white shadow-lg shadow-lifemed-500/20",
            sizeClass
          )}
        >
          {displayUrl ? (
            <Image src={displayUrl} alt={fullName} fill className="object-cover" unoptimized />
          ) : (
            getInitials(fullName)
          )}
        </div>

        {editable ? (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
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
          </>
        ) : null}
      </div>

      {editable && avatarUrl ? (
        <Button type="button" variant="ghost" size="sm" disabled={loading} onClick={handleRemove}>
          <Trash2 className="h-4 w-4" />
          {t("profile.removePhoto")}
        </Button>
      ) : null}

      {loading ? <p className="text-xs text-muted">{t("profile.photoUploading")}</p> : null}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
