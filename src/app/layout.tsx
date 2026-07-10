import type { Metadata, Viewport } from "next";

import "./globals.css";

import { BottomNav } from "@/components/bottom-nav";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { StoreProvider } from "@/components/store-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: `${APP_NAME} — What to do now`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_TAGLINE,
  manifest: "/manifest.webmanifest",
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
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5ff" },
    { media: "(prefers-color-scheme: dark)", color: "#121019" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-background font-sans text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>
            <div className="relative min-h-dvh">{children}</div>
            <BottomNav />
          </StoreProvider>
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
