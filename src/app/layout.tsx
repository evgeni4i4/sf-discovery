import type { Metadata, Viewport } from "next";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import "./globals.css";

export const metadata: Metadata = {
  title: "SF Discovery",
  description: "Discover and track your favorite spots in San Francisco",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SF Discovery",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a73e8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="antialiased h-full overscroll-none">
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
