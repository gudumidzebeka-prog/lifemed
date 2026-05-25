import { AppShell } from "@/components/layout/app-shell";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { HealthDataProvider } from "@/components/providers/health-data-provider";
import { MedicationReminderListener } from "@/components/medications/medication-reminder-listener";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const supabaseConfigured = isSupabaseConfigured();

  return (
    <HealthDataProvider supabaseConfigured={supabaseConfigured}>
      <MedicationReminderListener />
      <AppShell>{children}</AppShell>
    </HealthDataProvider>
  );
}
