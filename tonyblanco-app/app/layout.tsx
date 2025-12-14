import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./mobile-responsive.css";
import MainNav from "@/components/MainNav";
import MainFooter from "@/components/MainFooter";
import NotificationInitializer from "@/components/NotificationInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kabbalah Aplicada & Psicoterapias del Alma",
  description: "Plataforma de análisis cabalístico y numerología para profesionales del alma y buscadores personales. Descubre tu camino a través de la sabiduría ancestral.",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#D4AF37',
};

/**
 * Root Layout - Layout base sin navbar ni footer
 * 
 * Los route groups (public) y (dashboard) tienen sus propios layouts
 * que heredan de este layout raíz.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
