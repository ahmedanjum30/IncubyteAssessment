import type { Metadata, Viewport } from 'next';
import { Azeret_Mono, Schibsted_Grotesk } from 'next/font/google';
import { TopBar } from '@/components/TopBar';
import { Providers } from './providers';
import './globals.css';

const grotesk = Schibsted_Grotesk({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-grotesk',
  display: 'swap',
});

const azeret = Azeret_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-azeret',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'ACME Pay', template: '%s · ACME Pay' },
  description: 'Salary management and pay insights for ACME HR.',
};

export const viewport: Viewport = {
  themeColor: '#f5f4f6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${azeret.variable}`}>
      <body>
        <Providers>
          <TopBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
