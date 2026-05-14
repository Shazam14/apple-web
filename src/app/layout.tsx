import type { Metadata, Viewport } from "next";
import { Inter_Tight, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter-tight",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CoolEd",
  description: "Owner-controlled lending dashboard",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "CoolEd",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#2a6fdb",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${interTight.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
