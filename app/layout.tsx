import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "MRF World Cup Prediction Challenge",
  description: "Mobile-first football prediction PWA for MRF employees.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "MRF Predict",
    statusBarStyle: "black-translucent"
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#04111d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <QueryProvider>
          {children}
          <Toaster richColors position="top-center" />
        </QueryProvider>
      </body>
    </html>
  );
}
