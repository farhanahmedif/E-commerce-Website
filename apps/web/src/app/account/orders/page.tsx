import type { Metadata } from 'next';
import { AccountOrdersClient } from '@/components/orders/AccountOrdersClient';

export const metadata: Metadata = {
  title: 'আমার অর্ডার | হাটGo',
  robots: { index: false, follow: false },
};

export default function AccountOrdersPage() {
  return <AccountOrdersClient />;
}
