import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAppUrl, isOpenAIConfigured, isServiceRoleConfigured } from "@/lib/server-env";

export async function GET() {
  return NextResponse.json({
    supabase: isSupabaseConfigured(),
    serviceRole: isServiceRoleConfigured(),
    openai: isOpenAIConfigured(),
    appUrl: getAppUrl(),
    redirectUrl: `${getAppUrl()}/auth/callback`,
  });
}
