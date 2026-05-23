import { NextResponse } from "next/server";
import { getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/config";
import { getAppUrl, isOpenAIConfigured, isServiceRoleConfigured } from "@/lib/server-env";

function safeHost(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export async function GET() {
  const supabaseUrl = getSupabaseUrl();

  return NextResponse.json({
    supabase: isSupabaseConfigured(),
    supabaseHost: supabaseUrl ? safeHost(supabaseUrl) : null,
    serviceRole: isServiceRoleConfigured(),
    openai: isOpenAIConfigured(),
    appUrl: getAppUrl(),
    redirectUrl: `${getAppUrl()}/auth/callback`,
  });
}
