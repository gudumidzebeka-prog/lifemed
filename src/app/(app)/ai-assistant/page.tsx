"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/ui/badge";
import { DataModeBanner } from "@/components/layout/data-mode-banner";
import { useTranslation } from "@/components/providers/locale-provider";
import { useHealthDataContext } from "@/components/providers/health-data-provider";
import {
  Sparkles,
  Send,
  FileText,
  Pill,
  FlaskConical,
  Loader2,
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), locale }),
      });

      const data = await res.json();

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
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-lifemed-500" />
          {t("ai.title")}
        </h1>
        <p className="mt-1 text-muted">{t("ai.subtitle")}</p>
      </div>

      <Disclaimer variant="medical" className="mb-4" />
      <DataModeBanner mode={mode} />

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

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-lifemed-500 text-white rounded-br-md"
                    : "bg-surface-elevated text-foreground border border-border rounded-bl-md"
                }`}
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
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-surface-elevated border border-border px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-lifemed-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t border-border p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("ai.inputPlaceholder")}
              className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lifemed-400"
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <Disclaimer variant="medical" className="mt-2 text-center" />
        </div>
      </Card>
    </div>
  );
}
