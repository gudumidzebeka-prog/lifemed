import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { origin } = new URL(request.url);
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/auth/reset-password")}`;

    const response = NextResponse.json({ ok: true });
    const supabase = await createRouteHandlerClient(response);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: "Authentication service unavailable. Check Supabase URL and keys on Vercel." },
      { status: 500 }
    );
  }
}
