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
  const host = supabaseUrl ? safeHost(supabaseUrl) : null;

  return NextResponse.json({
    supabase: isSupabaseConfigured(),
    supabaseHost: host,
    supabaseUrlOk: Boolean(host?.endsWith(".supabase.co")),
    serviceRole: isServiceRoleConfigured(),
    openai: isOpenAIConfigured(),
    appUrl: getAppUrl(),
    redirectUrl: `${getAppUrl()}/auth/callback`,
  });
}
