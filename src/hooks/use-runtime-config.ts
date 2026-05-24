"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface RuntimeConfig {
  supabase: boolean;
  loading: boolean;
}

export function useRuntimeConfig(fallbackSupabase = isSupabaseConfigured()): RuntimeConfig {
  const [config, setConfig] = useState<RuntimeConfig>({
    supabase: fallbackSupabase,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/setup/status", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { supabase?: boolean } | null) => {
        if (cancelled) return;
        setConfig({
          supabase: Boolean(data?.supabase ?? fallbackSupabase),
          loading: false,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setConfig({ supabase: fallbackSupabase, loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, [fallbackSupabase]);

  return config;
}
