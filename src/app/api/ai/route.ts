import { NextRequest, NextResponse } from "next/server";
import { translations, type Locale } from "@/lib/i18n";
import type { AIClientSnapshot } from "@/lib/health/ai-client-snapshot";
import {
  buildAIHealthContext,
  buildSmartDemoResponse,
  formatContextForPrompt,
} from "@/lib/health/ai-context";
import { generateAIResponse, AIProviderError, type ChatTurn } from "@/lib/health/ai-provider";
import { isAIConfigured } from "@/lib/server-env";
import type { Appointment, HealthDocument, HealthProfile, TimelineEvent } from "@/types/health";

function parseLocale(value: unknown): Locale {
  if (value === "ru" || value === "en" || value === "ka") return value;
  return "ka";
}

function parseHistory(value: unknown): ChatTurn[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is { role: string; content: string } =>
        Boolean(item) &&
        typeof item === "object" &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.trim().length > 0
    )
    .map((item) => ({
      role: item.role as "user" | "assistant",
      content: item.content.trim(),
    }))
    .slice(-16);
}

function parseClientSnapshot(value: unknown): AIClientSnapshot | undefined {
  if (!value || typeof value !== "object") return undefined;

  const snapshot = value as Partial<AIClientSnapshot>;
  if (snapshot.mode !== "demo" && snapshot.mode !== "live") return undefined;
  if (!snapshot.profile || typeof snapshot.profile !== "object") return undefined;

  return {
    mode: snapshot.mode,
    profile: snapshot.profile as HealthProfile,
    timeline: Array.isArray(snapshot.timeline) ? (snapshot.timeline as TimelineEvent[]) : [],
    documents: Array.isArray(snapshot.documents) ? (snapshot.documents as HealthDocument[]) : [],
    appointments: Array.isArray(snapshot.appointments)
      ? (snapshot.appointments as Appointment[])
      : [],
  };
}

export async function POST(request: NextRequest) {
  let locale: Locale = "ka";

  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const message = typeof body.message === "string" ? body.message.trim() : "";
    locale = parseLocale(body.locale);
    const history = parseHistory(body.history);
    const clientSnapshot = parseClientSnapshot(body.clientSnapshot);
    const aiConfigured = isAIConfigured();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const medicalDisclaimer = translations[locale].disclaimers.medical;
    const ctx = await buildAIHealthContext(clientSnapshot);
    const contextPayload = formatContextForPrompt(ctx);
    const patientContext = JSON.stringify(contextPayload, null, 2);

    if (aiConfigured) {
      try {
        const ai = await generateAIResponse({
          locale,
          message,
          history,
          patientContext,
          medicalDisclaimer,
        });

        return NextResponse.json({
          response: ai.text,
          source: ai.provider,
          dataSource: ctx.source,
          aiConfigured: true,
        });
      } catch (err) {
        console.error("AI provider error:", err);
        const aiText = translations[locale].ai;

        if (err instanceof AIProviderError) {
          if (err.kind === "quota") {
            return NextResponse.json({
              response: aiText.quotaExceeded,
              source: "error",
              errorKind: "quota",
              dataSource: ctx.source,
              aiConfigured: true,
            });
          }

          if (err.kind === "auth") {
            return NextResponse.json({
              response: aiText.aiUnavailable,
              source: "error",
              errorKind: "auth",
              dataSource: ctx.source,
              aiConfigured: true,
            });
          }

          if (err.kind === "network") {
            return NextResponse.json(
              {
                response: aiText.errorConnection,
                source: "error",
                errorKind: "network",
                dataSource: ctx.source,
                aiConfigured: true,
              },
              { status: 503 }
            );
          }
        }

        return NextResponse.json(
          {
            response: aiText.aiUnavailable,
            source: "error",
            dataSource: ctx.source,
            aiConfigured: true,
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json({
      response: `${buildSmartDemoResponse(message, ctx, locale)}\n\n—\n${medicalDisclaimer}`,
      source: "demo",
      dataSource: ctx.source,
      aiConfigured: false,
      hint: translations[locale].ai.setupHint,
    });
  } catch (err) {
    console.error("AI route error:", err);
    return NextResponse.json(
      { error: translations[locale].ai.errorConnection, source: "error", aiConfigured: isAIConfigured() },
      { status: 500 }
    );
  }
}
