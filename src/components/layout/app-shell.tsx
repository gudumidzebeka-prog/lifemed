"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, type NavKey } from "@/lib/constants";
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
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ThemeToggle } from "./theme-toggle";
import { LifeMedLogo } from "./lifemed-logo";
import { LiveModeBadge } from "./live-mode-badge";
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
  return (
    <div className="px-4 py-6">
      <LifeMedLogo variant="sidebar" />
    </div>
  );
}

function MobileNavLink({
  item,
  active,
  label,
}: {
  item: (typeof NAV_ITEMS)[number];
  active: boolean;
  label: string;
}) {
  const Icon = iconMap[item.icon as keyof typeof iconMap];

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={label}
      className={cn(
        "flex w-[20vw] min-w-[20vw] max-w-[20vw] shrink-0 snap-start flex-col items-center justify-center gap-0.5 px-1 py-2 text-[9px] leading-[1.1] no-underline transition-colors box-border sm:text-[10px]",
        active
          ? "bg-lifemed-100 text-lifemed-700 dark:bg-lifemed-900/40 dark:text-lifemed-300"
          : "text-muted hover:bg-surface-elevated hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="w-full text-center font-medium line-clamp-2 break-words [overflow-wrap:anywhere]">
        {label}
      </span>
    </Link>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const activeEl = container.querySelector<HTMLElement>('[aria-current="page"]');
    if (!activeEl) return;

    const edge = 4;
    const targetLeft = activeEl.offsetLeft - (container.clientWidth - activeEl.offsetWidth) / 2;
    const maxScroll = container.scrollWidth - container.clientWidth;
    container.scrollTo({
      left: Math.max(0, Math.min(maxScroll, targetLeft - edge)),
      behavior: "smooth",
    });
  }, [pathname]);

  return (
    <nav className="lifemed-mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 w-full max-w-[100vw] border-t border-border bg-surface/95 backdrop-blur-xl safe-bottom lg:hidden">
      <div
        ref={scrollRef}
        className="flex w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <MobileNavLink
              key={item.href}
              item={item}
              active={active}
              label={t(`nav.${item.key as NavKey}`)}
            />
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .lifemed-shell a { text-decoration: none; color: inherit; }
            .lifemed-logo-link { text-decoration: none; color: inherit; cursor: pointer; }
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
            <div className="flex items-center gap-3">
              <LifeMedLogo variant="compact" />
              <LiveModeBadge />
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
            <div className="mx-auto max-w-6xl px-4 py-6 pb-28 lg:px-8 lg:py-8 lg:pb-8 safe-bottom">
              {children}
            </div>
          </main>

          <MobileBottomNav />
        </div>
      </div>
    </>
  );
}
