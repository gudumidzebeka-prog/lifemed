import { NextRequest, NextResponse } from "next/server";
import { translations, type Locale } from "@/lib/i18n";
import {
  buildAIHealthContext,
  buildSmartDemoResponse,
  formatContextForPrompt,
} from "@/lib/health/ai-context";
import { generateAIResponse, type ChatTurn } from "@/lib/health/ai-provider";
import { isAIConfigured } from "@/lib/server-env";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message;
    const locale = parseLocale(body.locale);
    const history = parseHistory(body.history);

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const medicalDisclaimer = translations[locale].disclaimers.medical;
    const ctx = await buildAIHealthContext();
    const contextPayload = formatContextForPrompt(ctx);
    const patientContext = JSON.stringify(contextPayload, null, 2);

    if (isAIConfigured()) {
      try {
        const ai = await generateAIResponse({
          locale,
          message: message.trim(),
          history,
          patientContext,
          medicalDisclaimer,
        });

        if (ai?.text) {
          return NextResponse.json({
            response: ai.text,
            source: ai.provider,
            dataSource: ctx.source,
          });
        }
      } catch (err) {
        console.error("AI provider error:", err);
        return NextResponse.json(
          {
            error: translations[locale].ai.errorConnection,
            source: "error",
          },
          { status: 502 }
        );
      }
    }

    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({
      response: `${buildSmartDemoResponse(message.trim(), ctx, locale)}\n\n—\n${medicalDisclaimer}`,
      source: "demo",
      dataSource: ctx.source,
      aiConfigured: false,
      hint: translations[locale].ai.setupHint,
    });
  } catch {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
