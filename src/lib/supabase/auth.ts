import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function getAuthRedirectUrl() {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/auth/callback`;
}

export async function signInWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    return { error: null as { message: string } | null, demo: true };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error, demo: false };
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  if (!isSupabaseConfigured()) {
    return { error: null as { message: string } | null, demo: true, needsConfirmation: false };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: getAuthRedirectUrl(),
    },
  });

  return {
    error,
    demo: false,
    needsConfirmation: !data.session && !error,
  };
}

export async function signInWithOAuth(provider: "google" | "apple") {
  if (!isSupabaseConfigured()) {
    window.location.href = "/dashboard";
    return;
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: getAuthRedirectUrl() },
  });

  if (error) throw error;
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    window.location.href = "/";
    return;
  }

  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = "/";
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
