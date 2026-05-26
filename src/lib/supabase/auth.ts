import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

import { type ProfileGender } from "@/lib/health/profile-gender";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
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

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string,
  extras?: { city?: string; gender?: ProfileGender }
) {
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
        city: extras?.city?.trim() ?? "",
        gender: extras?.gender ?? "",
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

export async function requestPasswordReset(email: string) {
  if (!isSupabaseConfigured()) {
    return {
      error: { message: "Password reset requires Supabase configuration" },
      demo: true,
    };
  }

  try {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ email: normalizeEmail(email) }),
    });

    const data = (await res.json()) as { error?: string };

    if (!res.ok) {
      return { error: { message: data.error ?? "Password reset failed" }, demo: false };
    }

    return { error: null, demo: false };
  } catch (err) {
    return { error: { message: authErrorMessage(err) }, demo: false };
  }
}

export async function resetPassword(newPassword: string) {
  if (!isSupabaseConfigured()) {
    return { error: { message: "Password reset requires Supabase configuration" }, demo: true };
  }

  try {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ password: newPassword.trim() }),
    });

    const data = (await res.json()) as { error?: string };

    if (!res.ok) {
      return { error: { message: data.error ?? "Password update failed" }, demo: false };
    }

    return { error: null, demo: false };
  } catch (err) {
    return { error: { message: authErrorMessage(err) }, demo: false };
  }
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
