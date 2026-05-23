import { NextRequest, NextResponse } from "next/server";
import { translations, type Locale } from "@/lib/i18n";
import {
  buildAIHealthContext,
  buildSmartDemoResponse,
  formatContextForPrompt,
} from "@/lib/health/ai-context";

const LOCALE_LANGUAGE: Record<Locale, string> = {
  ka: "Georgian",
  ru: "Russian",
  en: "English",
};

function parseLocale(value: unknown): Locale {
  if (value === "ru" || value === "en" || value === "ka") return value;
  return "ka";
}

export async function POST(request: NextRequest) {
  try {
    const { message, locale: reqLocale } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const locale = parseLocale(reqLocale);
    const medicalDisclaimer = translations[locale].disclaimers.medical;

    const ctx = await buildAIHealthContext();
    const contextPayload = formatContextForPrompt(ctx);
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && !apiKey.includes("your-openai")) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are LifeMed's compassionate health assistant. Use ONLY the patient context below. Never diagnose or prescribe. Use simple, reassuring language. Respond in ${LOCALE_LANGUAGE[locale]}. ${medicalDisclaimer}\n\nPatient context:\n${JSON.stringify(contextPayload, null, 2)}`,
            },
            { role: "user", content: message },
          ],
          max_tokens: 600,
          temperature: 0.6,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const response =
          data.choices?.[0]?.message?.content || buildSmartDemoResponse(message, ctx, locale);
        return NextResponse.json({ response, source: "openai", dataSource: ctx.source });
      }
    }

    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({
      response: `${buildSmartDemoResponse(message, ctx, locale)}\n\n${medicalDisclaimer}`,
      source: "demo",
      dataSource: ctx.source,
    });
  } catch {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
