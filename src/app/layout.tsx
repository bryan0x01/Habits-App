import type { Metadata, Viewport } from "next";

import "./globals.css";

import { BottomNav } from "@/components/bottom-nav";
import { AppearanceController } from "@/components/appearance-controller";
import { CloudProvider } from "@/components/cloud-provider";
import { Onboarding } from "@/components/onboarding";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { StoreProvider } from "@/components/store-provider";
import { APP_TAGLINE, PARENT_BRAND, PRODUCT_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  applicationName: PRODUCT_NAME,
  title: {
    default: `${PRODUCT_NAME} — What to do now`,
    template: `%s · ${PRODUCT_NAME}`,
  },
  description: APP_TAGLINE,
  authors: [{ name: PARENT_BRAND }],
  creator: PARENT_BRAND,
  publisher: PARENT_BRAND,
  openGraph: {
    type: "website",
    siteName: PRODUCT_NAME,
    title: PRODUCT_NAME,
    description: APP_TAGLINE,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: PRODUCT_NAME,
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
    { media: "(prefers-color-scheme: light)", color: "#f7f3e9" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0c16" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-background font-sans text-foreground">
        <StoreProvider>
            <AppearanceController />
            <CloudProvider>
              <div className="relative min-h-dvh">{children}</div>
              <Onboarding />
              <BottomNav />
            </CloudProvider>
          <ServiceWorkerRegister />
        </StoreProvider>
      </body>
    </html>
  );
}
