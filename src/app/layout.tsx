import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PWARegister } from "@/components/providers/pwa-register";
import { APP_NAME } from "@/lib/constants";
import { LOCALE_BCP47, LOCALE_STORAGE_KEY, type Locale } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

function parseLocale(value: string | undefined): Locale {
  if (value === "ru" || value === "en" || value === "ka") return value;
  return "ka";
}

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Lifelong Health History`,
    template: `%s | ${APP_NAME}`,
  },
  description: "LifeMed — lifelong health history",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3a9d94" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1015" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const initialLocale = parseLocale(cookieStore.get(LOCALE_STORAGE_KEY)?.value);

  return (
    <html lang={LOCALE_BCP47[initialLocale]} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className={`${inter.className} ${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <LocaleProvider initialLocale={initialLocale}>
          <ThemeProvider>
            <PWARegister />
            {children}
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
