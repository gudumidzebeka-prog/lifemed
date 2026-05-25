"use client";

import { FormEvent, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Disclaimer } from "@/components/ui/badge";
import { useTranslation } from "@/components/providers/locale-provider";
import { Loader2, Send, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/i18n";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface DashboardAiPanelProps {
  aiSummary: string;
  isEmptySummary: boolean;
  locale: Locale;
}

export function DashboardAiPanel({ aiSummary, isEmptySummary, locale }: DashboardAiPanelProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-16).map((msg) => ({ role: msg.role, content: msg.content }));

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ message: text.trim(), locale, history }),
      });

      const data = await res.json();
      const responseText =
        typeof data.response === "string" && data.response.trim()
          ? data.response
          : !res.ok
            ? (data.error ?? t("ai.aiUnavailable"))
            : t("ai.aiUnavailable");

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: responseText,
        },
      ]);
    } catch (err) {
      const errorText = err instanceof Error ? err.message : t("ai.errorConnection");
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: errorText,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <Card className="gradient-soft border-lifemed-200 dark:border-lifemed-800 overflow-hidden">
      <CardHeader className="gap-4 space-y-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lifemed-500 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>{t("dashboard.aiTitle")}</CardTitle>
              <p className="mt-0.5 text-sm text-muted">{t("dashboard.aiSubtitle")}</p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex w-full min-w-0 flex-1 gap-2 lg:max-w-md lg:pt-1"
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t("ai.inputPlaceholder")}
              disabled={loading}
              className="h-10"
              aria-label={t("ai.inputPlaceholder")}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} className="shrink-0">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isEmptySummary && <p className="leading-relaxed text-foreground">{aiSummary}</p>}

        {messages.length > 0 && (
          <div className="space-y-3 rounded-xl border border-border bg-surface/80 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[92%] rounded-2xl rounded-br-md bg-lifemed-500 px-4 py-2.5 text-sm text-white"
                    : "mr-auto max-w-[92%] rounded-2xl rounded-bl-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground"
                }
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("common.loading")}
              </div>
            )}
          </div>
        )}

        <Disclaimer variant="info" />
      </CardContent>
    </Card>
  );
}
