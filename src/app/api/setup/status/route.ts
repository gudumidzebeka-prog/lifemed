import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  getAppUrl,
  isAIConfigured,
  isGeminiConfigured,
  isGroqConfigured,
  isOpenAIConfigured,
  isServiceRoleConfigured,
} from "@/lib/server-env";

function safeHost(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const host = supabaseUrl ? safeHost(supabaseUrl) : null;
  const configured = isSupabaseConfigured();

  return NextResponse.json({
    supabase: configured,
    supabaseHost: host,
    supabaseUrlOk: Boolean(host?.endsWith(".supabase.co")),
    serviceRole: isServiceRoleConfigured(),
    ai: isAIConfigured(),
    aiLive: isAIConfigured(),
    gemini: isGeminiConfigured(),
    groq: isGroqConfigured(),
    openai: isOpenAIConfigured(),
    appUrl: getAppUrl(),
    redirectUrl: `${getAppUrl()}/auth/callback`,
  });
}
