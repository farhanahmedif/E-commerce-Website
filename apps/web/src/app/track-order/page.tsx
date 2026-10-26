import type { Metadata } from 'next';
import { TrackOrderClient } from '@/components/orders/TrackOrderClient';

export const metadata: Metadata = {
  title: 'অর্ডার ট্র্যাক | হাটGo',
  robots: { index: false, follow: false },
};

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; phone?: string }>;
}) {
  const params = await searchParams;
  return <TrackOrderClient initialOrderId={params.orderId} initialPhone={params.phone} />;
}
