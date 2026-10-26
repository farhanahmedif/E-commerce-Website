import type { Metadata } from 'next';
import { CartPageClient } from '@/components/cart/CartPageClient';

export const metadata: Metadata = {
  title: 'বাজারের ঝুড়ি | হাটGo',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartPageClient />;
}
