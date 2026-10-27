'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { formatBDT } from '@/lib/formatBDT';
import { getOrderStatus, getOrdersForDevice, orderStatuses, type MockOrder } from '@/lib/orders';

const statusLabels = ['অর্ডার পাওয়া গেছে', 'নিশ্চিত', 'পথে আছে', 'পৌঁছে গেছে'];

export function AccountOrdersClient() {
  const [orders, setOrders] = useState<MockOrder[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    void getOrdersForDevice().then((saved) => {
      if (!active) return;
      setOrders(saved);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);
  return (
    <main className="orders-page">
      <Container>
        <p className="listing-eyebrow">আপনার হাটের খাতা</p>
        <h1 className="orders-title">আমার অর্ডার</h1>
        <p className="text-haat-muted">
          {orders.some((order) => order.source === 'backend')
            ? 'এই device-এ করা backend ও demo order-এর browser copy এখানে থাকবে।'
            : 'এই ডিভাইসে করা ডেমো অর্ডারগুলো এখানে থাকবে।'}
        </p>
        {!loaded ? (
          <p aria-live="polite">অর্ডার খুঁজছি…</p>
        ) : orders.length ? (
          <div className="orders-list">
            {orders.map((order) => {
              const status = getOrderStatus(order);
              return (
                <article className="order-list-card" key={order.id}>
                  <header>
                    <strong>{order.id}</strong>
                    <span className="order-status-stamp">
                      {statusLabels[orderStatuses.indexOf(status)]}
                    </span>
                  </header>
                  <p>
                    {new Date(order.createdAt).toLocaleDateString('bn-BD')} ·{' '}
                    {order.items.length.toLocaleString('bn-BD')} ধরনের পণ্য
                  </p>
                  <p>{order.items.map((item) => item.nameBn).join(' · ')}</p>
                  <div className="order-card-total">
                    <span>সর্বমোট</span>
                    <strong>{formatBDT(order.total)}</strong>
                  </div>
                  <Link href={`/order/success/${encodeURIComponent(order.id)}`}>
                    অর্ডার দেখুন <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="listing-empty wishlist-empty">
            <p className="listing-eyebrow">খাতায় এখনো কোনো অর্ডার নেই</p>
            <h2>হাট ঘুরে পছন্দের পসরা বেছে নিন</h2>
            <Link href="/products">পণ্য দেখুন</Link>
          </div>
        )}
      </Container>
    </main>
  );
}
