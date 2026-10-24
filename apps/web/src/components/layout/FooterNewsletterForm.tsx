'use client';

import { useState, type FormEvent } from 'react';
import { z } from 'zod';

const emailSchema = z.string().trim().email('একটি সঠিক ইমেইল ঠিকানা লিখুন।');

export function FooterNewsletterForm() {
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
    <form className="mt-3 flex flex-col gap-2" onSubmit={submit}>
      <label className="sr-only" htmlFor="footer-newsletter-email">
        ইমেইল ঠিকানা
      </label>
      <input
        autoComplete="email"
        className="h-11 min-w-0 rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white placeholder:text-white/55 focus:border-haat-marigold focus:outline-none"
        id="footer-newsletter-email"
        name="email"
        placeholder="আপনার ইমেইল"
        type="email"
      />
      <button
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-haat-marigold px-5 py-2.5 font-semibold text-haat-green transition duration-200 hover:-translate-y-0.5 focus-visible:outline-offset-4"
        type="submit"
      >
        সাবস্ক্রাইব করুন
      </button>
      {message ? (
        <p aria-live="polite" className="text-sm font-semibold text-haat-marigold">
          {message}
        </p>
      ) : null}
    </form>
  );
}
