'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ShoppingBag } from 'lucide-react';
import { formatBDT } from '@/lib/formatBDT';
import { getDeliveryEstimate, getOrderById, type MockOrder } from '@/lib/orders';

const paymentNames = {
  cod: 'ক্যাশ অন ডেলিভারি',
  bkash: 'বিকাশ',
  nagad: 'নগদ',
  rocket: 'রকেট',
  card: 'কার্ড',
};

export function OrderSuccessClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<MockOrder | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    void getOrderById(orderId).then((saved) => {
      if (!active) return;
      setOrder(saved ?? null);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [orderId]);

  if (!loaded)
    return (
      <main className="order-success-page">
        <div className="checkout-loading" aria-live="polite">
          অর্ডারের তথ্য দেখা হচ্ছে…
        </div>
      </main>
    );
  if (!order) {
    return (
      <main className="order-success-page">
        <div className="mx-auto max-w-[var(--content-width)] px-4 sm:px-6 lg:px-8">
          <div className="order-success-card">
            <p className="listing-eyebrow">এই ঝুড়ির খবর পাওয়া গেল না</p>
            <h1 className="order-success-title">অর্ডারটি এই ডিভাইসে নেই</h1>
            <p>
              ডেমো অর্ডার শুধু যে ব্রাউজারে করা হয়েছে, সেখানেই সংরক্ষিত থাকে। অর্ডার নম্বরটি মিলিয়ে
              দেখুন।
            </p>
            <div className="order-flow-links">
              <Link href="/track-order">অর্ডার খুঁজুন</Link>
              <Link className="secondary" href="/products">
                পণ্য দেখুন
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="order-success-page">
      <div className="mx-auto max-w-[var(--content-width)] px-4 sm:px-6 lg:px-8">
        <div className="order-success-card">
          <span className="order-success-mark">
            <Check aria-hidden="true" className="size-7" />
          </span>
          <p className="listing-eyebrow">
            {order.source === 'backend'
              ? 'Backend-এ অর্ডার সংরক্ষিত হয়েছে'
              : 'পরীক্ষামূলক অর্ডার সংরক্ষিত হয়েছে'}
          </p>
          <h1 className="order-success-title">ধন্যবাদ, {order.customerName}!</h1>
          <p>
            {order.source === 'backend'
              ? 'অর্ডারটি backend database-এ সংরক্ষিত হয়েছে। বিক্রেতা dashboard বা delivery service এখনো যুক্ত হয়নি।'
              : 'এটি শুধু এই browser-এ রাখা demo order। বিক্রেতা অর্ডারটি পাননি, তাই পণ্য পাঠানো হবে না।'}
          </p>
          <strong className="order-success-id">অর্ডার নম্বর: {order.id}</strong>
          <div className="order-success-card order-success-details">
            <h2>অর্ডারের সারাংশ</h2>
            <ul className="checkout-item-list">
              {order.items.map((item) => (
                <li key={`${item.productId}:${item.variantLabel}`}>
                  <span>
                    <strong>{item.nameBn}</strong>
                    <small>
                      {item.quantity.toLocaleString('bn-BD')} × {formatBDT(item.price)}
                      {item.variantLabel ? ` · ${item.variantLabel}` : ''}
                    </small>
                  </span>
                  <b>{formatBDT(item.lineTotal)}</b>
                </li>
              ))}
            </ul>
            <div className="cart-summary-row">
              <span>পণ্যের দাম</span>
              <span>{formatBDT(order.subtotal)}</span>
            </div>
            {order.discount ? (
              <div className="cart-summary-row discount-row">
                <span>কুপন ছাড়</span>
                <span>− {formatBDT(order.discount)}</span>
              </div>
            ) : null}
            <div className="cart-summary-row">
              <span>ডেলিভারি</span>
              <span>{order.deliveryCharge ? formatBDT(order.deliveryCharge) : 'ফ্রি'}</span>
            </div>
            <div className="order-card-total">
              <strong>সর্বমোট</strong>
              <strong>{formatBDT(order.total)}</strong>
            </div>
            <p>
              পেমেন্ট: {paymentNames[order.paymentMethod]}
              {order.paymentMethod !== 'cod' ? ' · ডেমো মোড, কোনো টাকা নেওয়া হয়নি' : ''}
            </p>
            <p>
              ডেলিভারি ঠিকানা: {order.address}, {order.upazila}, {order.district}, {order.division}
            </p>
            <p>
              {order.source === 'backend'
                ? 'Courier service যুক্ত হলে delivery estimate দেখানো হবে।'
                : `সম্ভাব্য ডেলিভারি: ${getDeliveryEstimate(order.deliveryMethod)} (নমুনা estimate)`}
            </p>
            {order.paymentMethod !== 'cod' ? (
              <div className="payment-demo-panel">
                <strong>অনলাইন পেমেন্ট নির্দেশনা (ডেমো)</strong>
                <p>
                  প্রেরক নম্বর: {order.paymentSenderPhone} · ট্রানজ্যাকশন ID: {order.transactionId}
                </p>
                <p>এখানে বাস্তব কোনো পেমেন্ট সম্পন্ন হয়নি।</p>
              </div>
            ) : null}
          </div>
          <div className="order-flow-links">
            <Link
              href={`/track-order?orderId=${encodeURIComponent(order.id)}&phone=${encodeURIComponent(order.phone)}`}
            >
              অর্ডার ট্র্যাক করুন <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link className="secondary" href="/products">
              <ShoppingBag aria-hidden="true" className="size-4" /> কেনাকাটা চালিয়ে যান
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
