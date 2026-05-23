"use client";

import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "@/components/providers/locale-provider";

interface ShareQrCodeProps {
  value: string;
  size?: number;
}

export function ShareQrCode({ value, size = 192 }: ShareQrCodeProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <QRCodeSVG value={value} size={size} level="M" includeMargin />
      <p className="text-center text-xs text-muted mt-3">{t("share.scanHint")}</p>
    </div>
  );
}