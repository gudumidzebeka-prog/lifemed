import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  persistProfileUpdates,
  syncProfileContactToAuth,
  type ProfilePersistSlice,
} from "@/lib/health/profile-contact";
import { upsertProfileContactFields } from "@/lib/health/db";

async function ensureProfileColumns() {
  const admin = createAdminClient();
  if (!admin) return;

  await admin.rpc("lifemed_ensure_profile_columns");
}

export async function PATCH(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const updates = (await request.json()) as ProfilePersistSlice;
    const response = NextResponse.json({ ok: true });
    const supabase = await createRouteHandlerClient(response);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureProfileColumns();

    const { error } = await persistProfileUpdates(supabase, user.id, updates);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (updates.phone !== undefined || updates.email !== undefined) {
      await syncProfileContactToAuth(supabase, {
        phone: typeof updates.phone === "string" ? updates.phone : undefined,
        email: typeof updates.email === "string" ? updates.email : undefined,
      });
      await upsertProfileContactFields(supabase, user.id, {
        email: updates.email,
        phone: updates.phone,
      });
    }

    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers: response.headers,
    });
  } catch {
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
