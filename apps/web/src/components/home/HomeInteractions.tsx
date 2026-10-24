'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { z } from 'zod';
import { ProductCard } from '@/components/product/ProductCard';
import type { MockProduct } from '@/lib/mock/products';

const emailSchema = z.string().trim().email('একটি সঠিক ইমেইল ঠিকানা লিখুন।');

export function FeaturedTabs({ products }: { products: MockProduct[] }) {
  const [tab, setTab] = useState('নতুন');
  const visible =
    tab === 'জনপ্রিয়'
      ? [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 8)
      : tab === 'অফার'
        ? products.filter((product) => product.oldPrice > product.price).slice(0, 8)
        : [...products].reverse().slice(0, 8);
  return (
    <>
      <div aria-label="পণ্য বাছাই" className="mb-6 flex flex-wrap gap-2" role="tablist">
        {['নতুন', 'জনপ্রিয়', 'অফার'].map((item) => (
          <button
            aria-selected={tab === item}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition focus-visible:outline-offset-2 ${tab === item ? 'border-haat-green bg-haat-green text-white' : 'border-haat-green/25 bg-white/60 text-haat-green hover:bg-haat-marigold/20'}`}
            key={item}
            onClick={() => setTab(item)}
            role="tab"
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}

export function Countdown() {
  const [remaining, setRemaining] = useState('--:--:--');
  useEffect(() => {
    const deadline = Date.now() + 8 * 60 * 60 * 1000;
    const update = () => {
      const seconds = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setRemaining(
        [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
          .map((value) => String(value).padStart(2, '0'))
          .join(':'),
      );
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <time
      aria-label="ফ্ল্যাশ সেল শেষ হতে বাকি"
      className="rounded bg-haat-charcoal px-3 py-1.5 font-mono text-lg font-bold tracking-wider text-white"
      suppressHydrationWarning
    >
      {remaining}
    </time>
  );
}

export function NewsletterForm() {
  const [message, setMessage] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = emailSchema.safeParse(data.get('email'));
    if (!result.success) {
      setMessage(result.error.issues[0]?.message ?? 'ইমেইলটি আবার দেখুন।');
      return;
    }
    setMessage('ধন্যবাদ! হাটের নতুন খবর আপনার ইনবক্সে পৌঁছাবে।');
    event.currentTarget.reset();
  }
  return (
    <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={submit}>
      <label className="sr-only" htmlFor="newsletter-email">
        ইমেইল ঠিকানা
      </label>
      <input
        autoComplete="email"
        className="min-h-12 min-w-0 flex-1 rounded-md border border-haat-green/25 bg-white px-4 focus:border-haat-green focus:outline-none focus:ring-2 focus:ring-haat-marigold/50"
        id="newsletter-email"
        name="email"
        placeholder="আপনার ইমেইল ঠিকানা"
        type="email"
      />
      <button
        className="min-h-12 rounded-md bg-haat-green px-6 font-bold text-white shadow-[3px_3px_0_var(--green-deep)] transition hover:-translate-y-0.5"
        type="submit"
      >
        খবর পেতে যোগ দিন
      </button>
      <p
        aria-live="polite"
        className="basis-full text-sm font-semibold text-haat-green sm:absolute sm:mt-[3.8rem]"
      >
        {message}
      </p>
    </form>
  );
}
