import type { Metadata } from 'next';
import { OrderSuccessClient } from '@/components/orders/OrderSuccessClient';

export const metadata: Metadata = {
  title: 'অর্ডার নিশ্চিত | হাটGo',
  robots: { index: false, follow: false },
};

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderSuccessClient orderId={id} />;
}
