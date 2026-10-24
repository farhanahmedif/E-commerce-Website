import type { Metadata } from 'next';
import { Anek_Bangla, Hind_Siliguri } from 'next/font/google';
import '@/app/globals.css';
import { SiteLayout } from '@/components/layout/SiteLayout';

const displayFont = Anek_Bangla({
  weight: 'variable',
  subsets: ['latin', 'bengali'],
  variable: '--font-baloo',
  display: 'swap',
});

const bodyFont = Hind_Siliguri({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'bengali'],
  variable: '--font-hind',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'হাটGo | বাংলাদেশের ডিজিটাল হাট',
  description: 'গ্রামের হাটের আপন আমেজ, এখন আপনার হাতের মুঠোয়।',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  );
}
