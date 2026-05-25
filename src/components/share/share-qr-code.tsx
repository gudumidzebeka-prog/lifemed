"use client";

import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

interface ShareQrCodeProps {
  value: string;
  size?: number;
  showHint?: boolean;
  className?: string;
}

export function ShareQrCode({ value, size = 192, showHint = true, className }: ShareQrCodeProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("rounded-2xl border border-border bg-white p-3", className)}>
      <QRCodeSVG value={value} size={size} level="M" includeMargin />
      {showHint && <p className="text-center text-xs text-muted mt-2">{t("share.scanHint")}</p>}
    </div>
  );
}