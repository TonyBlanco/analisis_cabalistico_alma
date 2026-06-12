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
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'icon', url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  other: {
    'facebook-domain-verification': 'mohq5ipwjh2k8yy3igm81y3ah8dcpa',
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
