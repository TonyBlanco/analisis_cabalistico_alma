import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const DEFAULT_COOKIE_SCRIPT_SRC =
  "https://cdn.cookie-script.com/s/3137ed99ea4d07a01c82e4a6a5b6e414.js";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieScriptSrc =
    process.env.NEXT_PUBLIC_COOKIE_SCRIPT_SRC?.trim() || DEFAULT_COOKIE_SCRIPT_SRC;

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          type="text/javascript"
          charSet="UTF-8"
          src={cookieScriptSrc.startsWith("//") ? `https:${cookieScriptSrc}` : cookieScriptSrc}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen app-shell`}
        suppressHydrationWarning
      >
        <Providers>
          <main className="flex-1 w-full min-h-0 overflow-visible">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
