import { NextResponse } from "next/server";
import { clearAllDemoShares } from "@/lib/health/demo-share-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function POST() {
  if (isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  clearAllDemoShares();
  return NextResponse.json({ ok: true });
}
