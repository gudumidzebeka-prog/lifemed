"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, APP_NAME, type NavKey } from "@/lib/constants";
import { useTranslation } from "@/components/providers/locale-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import {
  LayoutDashboard,
  Clock,
  FolderOpen,
  Layers,
  Sparkles,
  Share2,
  Users,
  User,
  Heart,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const iconMap = {
  LayoutDashboard,
  Clock,
  FolderOpen,
  Layers,
  Sparkles,
  Share2,
  Users,
  User,
};

function NavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <nav className={cn("space-y-1", className)}>
      {NAV_ITEMS.map((item) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap];
        const active = isActive(item.href);
        const label = t(`nav.${item.key as NavKey}`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-all duration-200",
              active
                ? "bg-lifemed-100 text-lifemed-700 dark:bg-lifemed-900/40 dark:text-lifemed-300"
                : "text-muted hover:bg-surface-elevated hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  const { t } = useTranslation();

  return (
    <div className="border-t border-border p-4 space-y-3">
      <Button href="/emergency" variant="danger" className="w-full emergency-pulse" size="sm">
        <ShieldAlert className="h-4 w-4" />
        {t("nav.emergency")}
      </Button>
      <div className="flex items-center justify-between gap-2">
        <LanguageSwitcher size="sm" />
        <ThemeToggle />
        <Button href="/settings" variant="ghost" size="sm" className="text-muted">
          {t("nav.settings")}
        </Button>
      </div>
    </div>
  );
}

function SidebarHeader() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 px-4 py-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-md shadow-lifemed-500/20">
        <Heart className="h-5 w-5 text-white" fill="white" />
      </div>
      <div>
        <h1 className="font-semibold text-foreground">{APP_NAME}</h1>
        <p className="text-xs text-muted">{t("nav.sidebarTagline")}</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .lifemed-shell a { text-decoration: none; color: inherit; }
            @media (max-width: 1023px) {
              .lifemed-desktop-sidebar { display: none !important; }
            }
            @media (min-width: 1024px) {
              .lifemed-mobile-header { display: none !important; }
              .lifemed-mobile-bottom-nav { display: none !important; }
            }
          `,
        }}
      />

      <div className="lifemed-shell flex min-h-screen bg-background">
        <aside className="lifemed-desktop-sidebar hidden w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
          <SidebarHeader />
          <div className="flex flex-1 flex-col overflow-y-auto px-3">
            <NavLinks />
          </div>
          <SidebarFooter />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="lifemed-mobile-header sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface/80 px-4 py-3 backdrop-blur-xl safe-top lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Heart className="h-4 w-4 text-white" fill="white" />
              </div>
              <span className="font-semibold">{APP_NAME}</span>
            </div>
            <div className="flex items-center gap-1">
              <LanguageSwitcher size="sm" />
              <Button
                href="/emergency"
                variant="ghost"
                size="icon"
                className="text-rose-500"
                aria-label={t("nav.emergency")}
              >
                <ShieldAlert className="h-5 w-5" />
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </header>

          <AnimatePresence>
            {mobileOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/40 lg:hidden"
                  onClick={() => setMobileOpen(false)}
                />
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-surface shadow-xl lg:hidden"
                >
                  <div className="flex items-center justify-end p-3">
                    <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <SidebarHeader />
                  <div className="flex-1 overflow-y-auto px-3">
                    <NavLinks onNavigate={() => setMobileOpen(false)} />
                  </div>
                  <SidebarFooter />
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-6xl px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-8 safe-bottom">
              {children}
            </div>
          </main>

          <nav className="lifemed-mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/90 backdrop-blur-xl safe-bottom lg:hidden">
            <div className="flex items-center justify-around px-2 py-2">
              {NAV_ITEMS.slice(0, 5).map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs no-underline transition-colors",
                      active ? "text-lifemed-600 dark:text-lifemed-400" : "text-muted"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{t(`nav.${item.key as NavKey}`)}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
