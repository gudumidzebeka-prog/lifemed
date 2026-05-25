import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DEMO_PROFILE_NAME, DEMO_TIMELINE_TITLES } from "@/lib/health/demo-seed";

const DEMO_MEDICATIONS = ["Hydroxychloroquine", "Prednisone", "Vitamin D3"];

const DEMO_CONTACTS = ["Michael Chen", "Dr. Emily Watson"];

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.full_name !== DEMO_PROFILE_NAME) {
    return NextResponse.json({ cleared: false, reason: "not_demo_profile" });
  }

  await Promise.all([
    supabase.from("timeline_events").delete().eq("user_id", user.id).in("title", DEMO_TIMELINE_TITLES),
    supabase.from("medications").delete().eq("user_id", user.id).in("name", DEMO_MEDICATIONS),
    supabase.from("emergency_contacts").delete().eq("user_id", user.id).in("name", DEMO_CONTACTS),
    supabase.from("family_members").delete().eq("user_id", user.id).in("name", ["Michael Chen", "Emma Chen"]),
  ]);

  const metaName = user.user_metadata?.full_name;
  const fallbackName =
    typeof metaName === "string" && metaName.trim()
      ? metaName.trim()
      : user.email?.split("@")[0] ?? "User";

  await supabase
    .from("profiles")
    .update({
      full_name: fallbackName,
      date_of_birth: null,
      blood_type: null,
      allergies: [],
      chronic_illnesses: [],
    })
    .eq("id", user.id);

  return NextResponse.json({ cleared: true });
}
