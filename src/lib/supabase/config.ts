function cleanEnv(value: string | undefined) {
  if (!value) return "";
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getSupabaseUrl() {
  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  return url.replace(/\/+$/, "");
}

export function getSupabaseAnonKey() {
  return cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isSupabaseConfigured() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  return Boolean(
    url &&
      key &&
      isValidHttpUrl(url) &&
      !url.includes("your-project") &&
      !key.includes("your-anon-key") &&
      !key.includes("PASTE_LEGACY")
  );
}

/** Local-only preview without Supabase. Disabled on Vercel/production. */
export function isDemoModeEnabled() {
  return !isSupabaseConfigured();
}
