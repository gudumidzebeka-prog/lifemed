"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/ui/badge";
import { DataModeBanner } from "@/components/layout/data-mode-banner";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Send,
  FileText,
  Pill,
  FlaskConical,
  Loader2,
  RotateCcw,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistantPage() {
  const { t, locale } = useTranslation();
  const { mode } = useHealthDataContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLive, setAiLive] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasUserMessage = messages.some((msg) => msg.role === "user");
  const focusChat = loading || hasUserMessage;
  const lastMessage = messages[messages.length - 1];

  const resetChat = () => {
    setInput("");
    setLoading(false);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: t("ai.welcome"),
        timestamp: new Date(),
      },
    ]);
  };

  const quickPrompts = useMemo(
    () => [
      { icon: FileText, label: t("ai.promptSummarize"), prompt: t("ai.promptSummarize") },
      { icon: FlaskConical, label: t("ai.promptLabs"), prompt: t("ai.promptLabs") },
      { icon: Pill, label: t("ai.promptInteractions"), prompt: t("ai.promptInteractions") },
      { icon: FileText, label: t("ai.promptDoctor"), prompt: t("ai.promptDoctor") },
    ],
    [t]
  );

  useEffect(() => {
    fetch("/api/setup/status", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { ai?: boolean } | null) => setAiLive(Boolean(data?.ai)))
      .catch(() => setAiLive(false));
  }, []);

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: t("ai.welcome"),
        timestamp: new Date(),
      },
    ]);
  }, [t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  useEffect(() => {
    if (loading) {
      chatPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading]);

  useEffect(() => {
    if (!loading && hasUserMessage) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [loading, hasUserMessage]);

  useEffect(() => {
    if (!focusChat || window.matchMedia("(min-width: 1024px)").matches) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [focusChat]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter((msg) => msg.id !== "welcome")
        .slice(-16)
        .map((msg) => ({ role: msg.role, content: msg.content }));

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), locale, history }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      if (data.source === "demo") {
        setAiLive(false);
      } else if (data.source === "gemini" || data.source === "groq" || data.source === "openai") {
        setAiLive(true);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: t("ai.errorConnection"),
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col transition-all duration-300",
        focusChat
          ? "fixed inset-0 z-50 flex flex-col bg-background px-4 pb-4 pt-3 safe-top safe-bottom sm:px-6 lg:static lg:z-auto lg:inset-auto lg:h-[calc(100vh-6rem)] lg:px-0 lg:pt-0"
          : "h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]"
      )}
    >
      <div className={cn("mb-6 transition-all duration-300", focusChat && "mb-3 shrink-0")}>
        <div className="flex items-start justify-between gap-3">
          <h1
            className={cn(
              "font-bold text-foreground flex items-center gap-2 min-w-0",
              focusChat ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"
            )}
          >
            <Sparkles className={cn("text-lifemed-500 shrink-0", focusChat ? "h-5 w-5" : "h-7 w-7")} />
            <span className="truncate">{t("ai.title")}</span>
          </h1>
          {focusChat && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetChat}
              disabled={loading}
              className="shrink-0 text-muted"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">{t("ai.newChat")}</span>
            </Button>
          )}
        </div>
        {!focusChat && <p className="mt-1 text-muted">{t("ai.subtitle")}</p>}
      </div>

      {!focusChat && <Disclaimer variant="medical" className="mb-4" />}
      {aiLive === false && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          {t("ai.demoModeNote")}
        </div>
      )}
      {!focusChat && <DataModeBanner mode={mode} />}

      {!focusChat && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt.label}
              type="button"
              onClick={() => sendMessage(prompt.prompt)}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-lifemed-300 hover:text-foreground"
            >
              <prompt.icon className="h-3.5 w-3.5" />
              {prompt.label}
            </button>
          ))}
        </div>
      )}

      <Card
        ref={chatPanelRef}
        className={cn(
          "flex flex-col overflow-hidden transition-all duration-300",
          focusChat ? "flex-1 min-h-0 shadow-lg ring-1 ring-lifemed-200/60 dark:ring-lifemed-800/60" : "flex-1"
        )}
      >
        <CardContent className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isLatestAssistant =
              msg.role === "assistant" && msg.id === lastMessage?.id && hasUserMessage && !loading;
            const isOlderMessage =
              focusChat &&
              !isLatestAssistant &&
              !(msg.role === "user" && msg.id === lastMessage?.id);

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex transition-opacity duration-300",
                  msg.role === "user" ? "justify-end" : "justify-start",
                  isOlderMessage && "opacity-60"
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl leading-relaxed whitespace-pre-wrap break-words",
                    msg.role === "user"
                      ? "max-w-[85%] px-4 py-3 text-sm bg-lifemed-500 text-white rounded-br-md"
                      : "bg-surface-elevated text-foreground border border-border rounded-bl-md",
                    isLatestAssistant
                      ? "w-full max-w-full px-5 py-5 text-base sm:text-[17px] leading-7 min-h-[min(55vh,480px)] shadow-sm"
                      : msg.role === "assistant"
                        ? "max-w-[92%] px-4 py-3 text-sm"
                        : "",
                    isOlderMessage && "max-h-28 overflow-hidden"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1.5 mb-2 text-lifemed-600 dark:text-lifemed-400">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">{t("ai.brand")}</span>
                    </div>
                  )}
                  {msg.content}
                </div>
              </motion.div>
            );
          })}
          {loading && (
            <div className="flex justify-start">
              <div className="w-full max-w-full rounded-2xl bg-surface-elevated border border-border px-5 py-6 min-h-[min(40vh,320px)]">
                <div className="flex items-center gap-2 text-lifemed-600 dark:text-lifemed-400 mb-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">{t("ai.thinking")}</span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-border/70 animate-pulse" />
                  <div className="h-3 w-[92%] rounded bg-border/70 animate-pulse" />
                  <div className="h-3 w-[78%] rounded bg-border/70 animate-pulse" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t border-border p-4 shrink-0 bg-surface">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("ai.inputPlaceholder")}
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-lifemed-400"
              disabled={loading}
            />
            <Button type="submit" size="icon" className="h-11 w-11" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <Disclaimer variant="medical" className="mt-2 text-center" />
        </div>
      </Card>
    </div>
  );
}
