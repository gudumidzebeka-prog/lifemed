import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getAuthRedirectUrl() {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/auth/callback`;
}

function authErrorMessage(err: unknown) {
  const message = err instanceof Error ? err.message : "Unable to connect to authentication service";
  if (message.includes("Unexpected token") || message.includes("<!DOCTYPE")) {
    return "Supabase configuration error on server. Check Vercel env vars and redeploy.";
  }
  return message;
}

export async function signInWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    return { error: null as { message: string } | null, demo: true };
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        email: normalizeEmail(email),
        password: password.trim(),
      }),
    });

    const data = (await res.json()) as { error?: string };

    if (!res.ok) {
      return { error: { message: data.error ?? "Login failed" }, demo: false };
    }

    return { error: null, demo: false };
  } catch (err) {
    return { error: { message: authErrorMessage(err) }, demo: false };
  }
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  if (!isSupabaseConfigured()) {
    return { error: null as { message: string } | null, demo: true, needsConfirmation: false };
  }

  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        name: name.trim(),
        email: normalizeEmail(email),
        password: password.trim(),
      }),
    });

    const data = (await res.json()) as { error?: string; needsConfirmation?: boolean };

    if (!res.ok) {
      return { error: { message: data.error ?? "Signup failed" }, demo: false, needsConfirmation: false };
    }

    return {
      error: null,
      demo: false,
      needsConfirmation: Boolean(data.needsConfirmation),
    };
  } catch (err) {
    return {
      error: { message: authErrorMessage(err) },
      demo: false,
      needsConfirmation: false,
    };
  }
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
