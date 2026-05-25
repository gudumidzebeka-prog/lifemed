"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/ui/badge";
import { useTranslation } from "@/components/providers/locale-provider";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Loader2, Send, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/i18n";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface DashboardAiPanelProps {
  locale: Locale;
}

export function DashboardAiPanel({ locale }: DashboardAiPanelProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isChatActive = messages.length > 0 || loading || input.trim().length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, isChatActive]);

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
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <Card
      className={cn(
        "gradient-soft grid overflow-hidden border-lifemed-200 transition-all duration-300 dark:border-lifemed-800",
        "min-h-[min(52vh,480px)] grid-rows-[auto_minmax(0,1fr)_auto]",
        isChatActive && "min-h-[min(78vh,720px)]"
      )}
    >
      <CardHeader className="shrink-0 border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lifemed-500 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <CardTitle>{APP_NAME} AI</CardTitle>
        </div>
      </CardHeader>

      <div
        className={cn(
          "min-h-0 overflow-y-auto bg-surface/40 px-4 py-4 sm:px-5",
          isChatActive ? "min-h-[min(42vh,380px)]" : "min-h-[120px]"
        )}
      >
        {messages.length === 0 && !loading ? (
          <div className="flex h-full min-h-[120px] items-center justify-center px-4 text-center text-sm text-muted">
            {t("ai.inputPlaceholder")}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isLatestAssistant =
                message.role === "assistant" && index === messages.length - 1 && !loading;

              return (
                <div
                  key={message.id}
                  className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "whitespace-pre-wrap break-words leading-relaxed",
                      message.role === "user"
                        ? "max-w-[88%] rounded-2xl rounded-br-md bg-lifemed-500 px-4 py-3 text-sm text-white sm:text-base"
                        : "rounded-2xl rounded-bl-md border border-border bg-surface text-foreground",
                      message.role === "assistant" && isLatestAssistant
                        ? "w-full max-w-full px-5 py-4 text-base sm:text-[17px] sm:leading-7"
                        : message.role === "assistant"
                          ? "max-w-[92%] px-4 py-3 text-sm sm:text-base"
                          : ""
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="mb-2 flex items-center gap-1.5 text-lifemed-600 dark:text-lifemed-400">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">{t("ai.brand")}</span>
                      </div>
                    )}
                    {message.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="min-h-[min(24vh,220px)] w-full max-w-full rounded-2xl border border-border bg-surface px-5 py-5">
                  <div className="mb-3 flex items-center gap-2 text-lifemed-600 dark:text-lifemed-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">{t("ai.thinking")}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-border/70" />
                    <div className="h-3 w-[92%] animate-pulse rounded bg-border/70" />
                    <div className="h-3 w-[78%] animate-pulse rounded bg-border/70" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border bg-surface p-4 sm:p-5">
        <Disclaimer variant="info" className="mb-3" />
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t("ai.inputPlaceholder")}
            disabled={loading}
            aria-label={t("ai.inputPlaceholder")}
            className="flex-1 rounded-xl border border-border bg-field px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-lifemed-400 disabled:opacity-50 dark:bg-surface sm:text-sm"
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 shrink-0"
            disabled={loading || !input.trim()}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </Card>
  );
}
