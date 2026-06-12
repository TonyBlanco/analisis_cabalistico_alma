import { Cormorant_Garamond, Inter } from 'next/font/google';
import '../../design/brand/tokens.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-theme="oro"
      className={`${cormorant.variable} ${inter.variable} min-h-screen bg-[var(--ha-bg)] font-[family-name:var(--font-inter)] text-[var(--ha-ink)] antialiased`}
    >
      {children}
    </div>
  );
}