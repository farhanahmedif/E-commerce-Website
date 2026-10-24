import type { ReactNode } from 'react';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { CartExperience } from '@/components/cart/CartExperience';

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <AnnouncementBar />
      <Navbar />
      {children}
      <CartExperience />
      <Footer />
    </div>
  );
}
