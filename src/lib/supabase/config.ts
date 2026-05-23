export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
      key &&
      !url.includes("your-project") &&
      !key.includes("your-anon-key")
  );
}

/** Local-only preview without Supabase. Disabled on Vercel/production. */
export function isDemoModeEnabled() {
  return !isSupabaseConfigured();
}
