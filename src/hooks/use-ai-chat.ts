"use client";

import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { buildClientHealthSnapshot } from "@/lib/health/ai-client-snapshot";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import type { ChatTurn } from "@/lib/health/ai-provider";

export interface AIChatResponse {
  response: string;
  source?: string;
  dataSource?: string;
  aiConfigured?: boolean;
  hint?: string;
  errorKind?: string;
}

export function useAiChat(locale: Locale) {
  const { mode, profile, timeline, documents, appointments } = useHealthDataContext();
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/ai/status", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((data: { configured?: boolean }) => setAiConfigured(Boolean(data.configured)))
      .catch(() => setAiConfigured(false));
  }, []);

  const sendAiMessage = useCallback(
    async (message: string, history: ChatTurn[]): Promise<AIChatResponse> => {
      const clientSnapshot = buildClientHealthSnapshot({
        mode,
        profile,
        timeline,
        documents,
        appointments,
      });

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          message,
          locale,
          history,
          clientSnapshot,
        }),
      });

      const data = (await res.json()) as AIChatResponse & { error?: string };

      if (typeof data.aiConfigured === "boolean") {
        setAiConfigured(data.aiConfigured);
      } else if (data.source && data.source !== "demo" && data.source !== "error") {
        setAiConfigured(true);
      } else if (data.source === "demo") {
        setAiConfigured(false);
      }

      if (typeof data.response === "string" && data.response.trim()) {
        return data;
      }

      if (!res.ok) {
        throw new Error(data.error ?? data.response ?? "AI unavailable");
      }

      return {
        response: data.response ?? "",
        source: data.source,
        dataSource: data.dataSource,
        aiConfigured: data.aiConfigured,
        hint: data.hint,
      };
    },
    [appointments, documents, locale, mode, profile, timeline]
  );

  return {
    aiConfigured,
    sendAiMessage,
  };
}
