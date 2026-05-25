"use client";

import { useEffect, useState } from "react";
import { Loader2, QrCode } from "lucide-react";
import { ShareQrCode } from "@/components/share/share-qr-code";
import { useTranslation } from "@/components/providers/locale-provider";
import { useMedicalShareQr } from "@/hooks/use-medical-share-qr";
import { cn } from "@/lib/utils";

const QR_SIZES = {
  xs: 64,
  sm: 80,
  md: 96,
  lg: 120,
} as const;

type MedicalShareQrSize = keyof typeof QR_SIZES;

interface MedicalShareQrProps {
  size?: MedicalShareQrSize;
  showHint?: boolean;
  title?: string;
  className?: string;
  variant?: "light" | "default";
}

export function MedicalShareQr({
  size = "md",
  showHint = false,
  title,
  className,
  variant = "default",
}: MedicalShareQrProps) {
  const { t } = useTranslation();
  const { url, loading, error } = useMedicalShareQr();
  const qrSize = QR_SIZES[size];

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border border-border bg-surface",
          className
        )}
        style={{ width: qrSize + 24, height: qrSize + 24 }}
      >
        <Loader2 className="h-5 w-5 animate-spin text-muted" />
      </div>
    );
  }

  if (error || !url) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-2 py-3 text-center",
          className
        )}
        style={{ width: qrSize + 24 }}
      >
        <QrCode className="h-5 w-5 text-muted" />
        <p className="mt-1 text-[10px] text-muted leading-tight">{t("profile.medicalQrUnavailable")}</p>
      </div>
    );
  }

  return (
    <div className={cn("shrink-0", className)}>
      {title && (
        <p
          className={cn(
            "mb-2 text-[10px] font-semibold uppercase tracking-wide",
            variant === "light" ? "text-white/90" : "text-muted"
          )}
        >
          {title}
        </p>
      )}
      <ShareQrCode
        value={url}
        size={qrSize}
        showHint={showHint}
        className={variant === "light" ? "border-white/20 bg-white" : undefined}
      />
    </div>
  );
}

export function MedicalShareQrBottomSection({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-4 md:hidden",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <MedicalShareQr size="lg" showHint />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{t("profile.medicalQrTitle")}</p>
          <p className="mt-1 text-xs text-muted leading-relaxed">{t("profile.medicalQrDoctorHint")}</p>
        </div>
      </div>
    </div>
  );
}

export function MedicalShareQrStickyBar() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 240);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 inset-x-0 z-40 px-4 md:hidden pointer-events-none">
      <div className="pointer-events-auto mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-surface/95 p-3 shadow-lg backdrop-blur">
        <MedicalShareQr size="xs" />
        <p className="text-xs text-muted leading-snug">{t("profile.medicalQrStickyHint")}</p>
      </div>
    </div>
  );
}
