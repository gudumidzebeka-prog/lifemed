import { AppShell } from "@/components/layout/app-shell";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { HealthDataProvider } from "@/components/providers/health-data-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const supabaseConfigured = isSupabaseConfigured();

  return (
    <HealthDataProvider supabaseConfigured={supabaseConfigured}>
      <AppShell>{children}</AppShell>
    </HealthDataProvider>
  );
}
