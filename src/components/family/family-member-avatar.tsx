"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Baby, UserCircle } from "lucide-react";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { cn } from "@/lib/utils";

interface FamilyMemberAvatarProps {
  name: string;
  avatarUrl?: string;
  isChild?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-14 w-14 rounded-2xl",
  md: "h-16 w-16 rounded-2xl",
  lg: "h-20 w-20 rounded-3xl",
};

const iconSizes = {
  sm: "h-7 w-7",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function FamilyMemberAvatar({
  name,
  avatarUrl,
  isChild = false,
  size = "sm",
  className,
}: FamilyMemberAvatarProps) {
  const { resolveAvatarUrl } = useHealthDataContext();
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const Icon = isChild ? Baby : UserCircle;

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

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-lifemed-50 text-lifemed-600 dark:bg-lifemed-950/50",
        sizeClasses[size],
        className
      )}
    >
      {displayUrl ? (
        <Image src={displayUrl} alt={name} fill className="object-cover" unoptimized />
      ) : name.trim() ? (
        <span className="text-sm font-bold text-lifemed-700 dark:text-lifemed-300">
          {getInitials(name)}
        </span>
      ) : (
        <Icon className={iconSizes[size]} />
      )}
    </div>
  );
}
