"use client";

import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { useTranslation } from "@/components/providers/locale-provider";

function LoginLoading() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center">{t("common.loading")}</div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
