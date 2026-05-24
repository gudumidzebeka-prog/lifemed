import { LandingPageClient } from "@/app/landing-page-client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LandingPage() {
  return <LandingPageClient demoEnabled={!isSupabaseConfigured()} />;
}
