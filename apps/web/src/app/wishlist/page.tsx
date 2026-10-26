import type { Metadata } from 'next';
import { WishlistClient } from '@/components/cart/WishlistClient';

export const metadata: Metadata = {
  title: 'পছন্দের তালিকা | হাটGo',
};

export default function WishlistPage() {
  return <WishlistClient />;
}
