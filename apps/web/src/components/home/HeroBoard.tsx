'use client';

import { useEffect, useRef, type PointerEvent } from 'react';
import Link from 'next/link';
import { ArrowDownRight, Sparkles } from 'lucide-react';

export function HeroBoard() {
  const board = useRef<HTMLElement>(null);
  const market = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () =>
      market.current?.style.setProperty(
        '--parallax-offset',
        `${Math.min(window.scrollY * 0.035, 34)}px`,
      );
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  function moveHighlight(event: PointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    board.current?.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
    board.current?.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
  }
  return (
    <section
      aria-labelledby="hero-title"
      className="haat-hero relative overflow-hidden"
      onPointerMove={moveHighlight}
      ref={board}
    >
      <div aria-hidden="true" className="hero-thread" />
      <div className="hero-content mx-auto grid w-full max-w-[var(--content-width)] items-center gap-9 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:px-8 lg:py-20">
        <div className="relative z-10">
          <p className="inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-haat-brick bg-[#fff8e8] px-3 py-1 text-sm font-bold text-haat-brick">
            <Sparkles aria-hidden="true" className="size-4" /> বাংলাদেশের নিজের ডিজিটাল হাট
          </p>
          <h1
            className="mt-5 font-display text-4xl font-extrabold leading-tight text-haat-green sm:text-5xl lg:text-[3.65rem]"
            id="hero-title"
          >
            পাড়ার হাটের
            <br />
            <span className="text-haat-brick">আমেজ এবার</span>
            <br />
            আপনার ঘরে
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-haat-charcoal/75 sm:text-lg">
            চেনা কারিগর, টাটকা বাজার আর ন্যায্য দামের পসরা—বাংলার হাটকে সঙ্গে নিয়ে চলুন, ঘরে বসেই।
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link
              className="inline-flex min-h-12 items-center gap-2 rounded-md bg-haat-green px-5 py-3 font-bold text-white shadow-[4px_4px_0_var(--green-deep)] transition hover:-translate-y-0.5 focus-visible:outline-offset-4"
              href="#shops"
            >
              হাটে ঢুকুন <ArrowDownRight aria-hidden="true" className="size-5" />
            </Link>
            <Link
              className="rounded-md border-2 border-haat-green px-4 py-2.5 font-bold text-haat-green transition hover:bg-haat-green/10 focus-visible:outline-offset-4"
              href="/products"
            >
              সব পণ্য দেখুন
            </Link>
          </div>
        </div>
        <div
          className="hero-market relative mx-auto h-[350px] w-full max-w-[600px] sm:h-[430px]"
          aria-label="বাংলার রঙিন হাটের চিত্র"
          ref={market}
        >
          <div className="hero-stall hero-stall-left" aria-hidden="true">
            <span>টাটকা বাজার</span>
            <i className="stall-produce" />
          </div>
          <div className="hero-stall hero-stall-right" aria-hidden="true">
            <span>কারিগরের কাজ</span>
            <i className="stall-craft" />
          </div>
          <div className="hero-board signboard">
            <span className="hero-board-top">আজকের জমজমাট পসরা</span>
            <span className="hero-logo">
              হাট<span>Go</span>
            </span>
            <span className="hero-board-bottom">বাংলার হাট, আপনার হাতের মুঠোয়</span>
          </div>
          <div className="hero-price-tag">
            <span>আজকের দাম</span>
            <strong>৳ ৮৫০</strong>
          </div>
          <span aria-hidden="true" className="hero-star hero-star-one">
            ✳
          </span>
          <span aria-hidden="true" className="hero-star hero-star-two">
            ✦
          </span>
        </div>
      </div>
      <div className="hero-bottom-note">
        প্রতিটি পণ্যে মাটির গন্ধ, মানুষের গল্প <span aria-hidden="true">✺</span>
      </div>
    </section>
  );
}
