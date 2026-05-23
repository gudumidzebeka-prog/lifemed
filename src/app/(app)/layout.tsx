import { AppShell } from "@/components/layout/app-shell";
import { HealthDataProvider } from "@/components/providers/health-data-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <HealthDataProvider>
      <AppShell>{children}</AppShell>
    </HealthDataProvider>
  );
}
