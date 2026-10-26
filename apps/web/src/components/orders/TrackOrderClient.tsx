'use client';

import { useState, type FormEvent } from 'react';
import { z } from 'zod';
import { formatBDT } from '@/lib/formatBDT';
import {
  getDemoOrderStatus,
  getDeliveryEstimate,
  getOrderById,
  normalizeBangladeshPhone,
  orderStatuses,
  type MockOrder,
} from '@/lib/orders';

const trackingSchema = z.object({
  orderId: z
    .string()
    .trim()
    .regex(/^HG-\d{4}-\d{6}$/i, 'অর্ডার নম্বর HG-2026-000123-এর মতো লিখুন।'),
  phone: z
    .string()
    .trim()
    .regex(/^(?:01\d{9}|\+8801\d{9})$/, 'সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন।'),
});

const statusCopy = [
  ['অর্ডার পাওয়া গেছে', 'আপনার অর্ডারটি হাটে নথিভুক্ত হয়েছে।'],
  ['নিশ্চিত করা হয়েছে', 'অর্ডারের তথ্য যাচাই করা হয়েছে।'],
  ['পথে আছে', 'পণ্যটি আপনার ঠিকানার পথে রয়েছে।'],
  ['পৌঁছে গেছে', 'অর্ডারটি আপনার হাতে পৌঁছেছে।'],
] as const;

export function TrackOrderClient({
  initialOrderId = '',
  initialPhone = '',
}: {
  initialOrderId?: string;
  initialPhone?: string;
}) {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<MockOrder | null>(null);
  const [searched, setSearched] = useState(false);

  async function searchOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearched(false);
    const parsed = trackingSchema.safeParse({ orderId, phone });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'তথ্যগুলো আবার দেখুন।');
      setOrder(null);
      return;
    }
    const match = await getOrderById(parsed.data.orderId);
    if (
      !match ||
      normalizeBangladeshPhone(match.phone) !== normalizeBangladeshPhone(parsed.data.phone)
    ) {
      setOrder(null);
      setSearched(true);
      setError('এই অর্ডার নম্বর ও ফোন নম্বরের মিল পাওয়া যায়নি।');
      return;
    }
    setError('');
    setOrder(match);
    setSearched(true);
  }

  const currentStatus = order ? getDemoOrderStatus(order) : 'pending';
  const currentIndex = orderStatuses.indexOf(currentStatus);
  return (
    <main className="tracking-page">
      <div className="mx-auto max-w-[var(--content-width)] px-4 sm:px-6 lg:px-8">
        <p className="listing-eyebrow">হাট থেকে আপনার ঠিকানায়</p>
        <h1 className="tracking-title">অর্ডার ট্র্যাক করুন</h1>
        <p className="text-haat-muted">অর্ডার নম্বর ও অর্ডারে দেওয়া মোবাইল নম্বর লিখুন।</p>
        <form className="tracking-form" noValidate onSubmit={searchOrder}>
          <div className="checkout-field">
            <label htmlFor="track-order-id">অর্ডার নম্বর</label>
            <input
              aria-describedby="tracking-form-error"
              aria-invalid={Boolean(error)}
              autoComplete="off"
              id="track-order-id"
              onChange={(event) => setOrderId(event.target.value)}
              placeholder="HG-2026-000123"
              value={orderId}
            />
          </div>
          <div className="checkout-field">
            <label htmlFor="track-phone">মোবাইল নম্বর</label>
            <input
              aria-describedby="tracking-form-error"
              aria-invalid={Boolean(error)}
              autoComplete="tel"
              id="track-phone"
              inputMode="tel"
              onChange={(event) => setPhone(event.target.value)}
              placeholder="01XXXXXXXXX"
              value={phone}
            />
          </div>
          <button type="submit">অর্ডার খুঁজুন</button>
          <p aria-live="polite" className="tracking-result-message" id="tracking-form-error">
            {error}
          </p>
        </form>
        {order ? (
          <section aria-labelledby="tracking-result-title" className="tracking-card">
            <div className="order-list-card headerless">
              <p className="listing-eyebrow" id="tracking-result-title">
                {order.id}
              </p>
              <p>
                {order.items.length.toLocaleString('bn-BD')} ধরনের পণ্য · {formatBDT(order.total)} ·
                সম্ভাব্য ডেলিভারি {getDeliveryEstimate(order.deliveryMethod)}
              </p>
            </div>
            <ol className="tracking-timeline">
              {statusCopy.map(([title, detail], index) => (
                <li className={`timeline-step ${index <= currentIndex ? 'done' : ''}`} key={title}>
                  <span>{index < currentIndex ? '✓' : index + 1}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="checkout-safe-note">
              ডেমো অর্ডারের অগ্রগতি সময়ের সঙ্গে স্বয়ংক্রিয়ভাবে এগোয়; বাস্তব courier update নেই।
            </p>
          </section>
        ) : null}
        {searched && !order ? (
          <p aria-live="polite" className="tracking-card">
            অর্ডারটি খুঁজে পাওয়া গেলে এর অগ্রগতি এখানে দেখা যাবে।
          </p>
        ) : null}
      </div>
    </main>
  );
}
