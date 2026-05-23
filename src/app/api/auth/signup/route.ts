import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAppUrl } from "@/lib/server-env";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    const supabase = await createClient();
    const appUrl = getAppUrl();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${appUrl}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      needsConfirmation: !data.session,
    });
  } catch {
    return NextResponse.json(
      { error: "Authentication service unavailable. Check Supabase URL and keys on Vercel." },
      { status: 500 }
    );
  }
}
