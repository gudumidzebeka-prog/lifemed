import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/config";

interface RuntimeSupabaseConfig {
  supabase: boolean;
}

let cachedConfig: RuntimeSupabaseConfig | null = null;
let configPromise: Promise<RuntimeSupabaseConfig> | null = null;
let serverSupabaseHint = false;

export function configureSupabaseRuntimeHint(configured: boolean) {
  serverSupabaseHint = configured;
  if (configured && cachedConfig && !cachedConfig.supabase) {
    cachedConfig = null;
  }
}

export async function resolveSupabaseConfig(): Promise<RuntimeSupabaseConfig> {
  if (cachedConfig) return cachedConfig;
  if (configPromise) return configPromise;

  configPromise = fetch("/api/setup/status", { cache: "no-store", credentials: "same-origin" })
    .then(async (res) => {
      if (!res.ok) throw new Error("Failed to load setup status");
      return (await res.json()) as RuntimeSupabaseConfig;
    })
    .then((data) => {
      cachedConfig = {
        supabase: Boolean(data.supabase) || serverSupabaseHint,
      };
      return cachedConfig;
    })
    .catch(() => {
      const fallback = { supabase: serverSupabaseHint || isSupabaseConfigured() };
      cachedConfig = fallback;
      return fallback;
    })
    .finally(() => {
      configPromise = null;
    });

  return configPromise;
}

export function createClientFromConfig(config: RuntimeSupabaseConfig): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (!config.supabase || !url || !key) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
    );
  }

  return createBrowserClient(url, key);
}

export async function createRuntimeClient() {
  const config = await resolveSupabaseConfig();
  return createClientFromConfig(config);
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
    );
  }

  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}
