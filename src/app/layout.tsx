import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import Analytics from "@/components/analytics/Analytics";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DUTCH.IND — Brand Streetwear Premium Indonesia",
    template: "%s | DUTCH.IND",
  },
  description:
    "Temukan koleksi streetwear premium Indonesia. Hoodie, kaos, celana, dan aksesori eksklusif untuk gaya urban modern kamu.",
  keywords: ["streetwear", "fashion", "indonesia", "hoodie", "kaos", "urban"],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "DUTCH.IND",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DUTCH.IND",
  },
  formatDetection: { telephone: false },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="id" className="dark">
      <head>
        <meta name="theme-color" content="#050507" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* iOS PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DUTCH.IND" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
        {/* iOS Splash Screens (most common sizes) */}
        <link rel="apple-touch-startup-image" href="/splash-750x1334.png" media="(device-width: 375px) and (device-height: 667px)" />
        <link rel="apple-touch-startup-image" href="/splash-1125x2436.png" media="(device-width: 375px) and (device-height: 812px)" />
        <link rel="apple-touch-startup-image" href="/splash-1170x2532.png" media="(device-width: 390px) and (device-height: 844px)" />
        <link rel="apple-touch-startup-image" href="/splash-1284x2778.png" media="(device-width: 428px) and (device-height: 926px)" />
      </head>
      <body className="font-sans antialiased">
        <SessionProvider session={session}>
          <ServiceWorkerRegistration />
          <PWAInstallPrompt />
          <Analytics />
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#171717",
                color: "#F5F5F5",
                border: "1px solid #262626",
                borderRadius: "0",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#F5F5F5", secondary: "#0A0A0A" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#F5F5F5" },
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
