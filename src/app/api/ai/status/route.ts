import { NextResponse } from "next/server";
import { isAIConfigured, isGeminiConfigured, isGroqConfigured, isOpenAIConfigured } from "@/lib/server-env";

export async function GET() {
  return NextResponse.json({
    configured: isAIConfigured(),
    groq: isGroqConfigured(),
    gemini: isGeminiConfigured(),
    openai: isOpenAIConfigured(),
  });
}
