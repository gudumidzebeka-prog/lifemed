import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/config";

export async function createRouteHandlerClient(initialResponse: NextResponse) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
          initialResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  return supabase;
}

export async function createRouteHandlerClientWithResponse(): Promise<{
  supabase: SupabaseClient;
  response: NextResponse;
}> {
  const response = NextResponse.next();
  const supabase = await createRouteHandlerClient(response);
  return { supabase, response };
}
