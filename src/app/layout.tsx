import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import Analytics from "@/components/analytics/Analytics";
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
      </head>
      <body className="font-sans antialiased">
        <SessionProvider session={session}>
          <Analytics />
          {children}
          <Toaster
            position="bottom-center"
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
