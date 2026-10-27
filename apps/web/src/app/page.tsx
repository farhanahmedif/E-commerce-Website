import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ClipboardList, Info, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductCard } from '@/components/product/ProductCard';
import { categories } from '@/lib/mock/categories';
import { getCatalogProducts } from '@/lib/catalog';
import { formatBDT } from '@/lib/formatBDT';
import { FeaturedTabs, NewsletterForm } from '@/components/home/HomeInteractions';
import { HeroBoard } from '@/components/home/HeroBoard';

export const metadata: Metadata = {
  title: 'হাটGo | বাংলার ডিজিটাল হাট',
  description: 'বাংলার কারিগর, টাটকা বাজার আর ন্যায্য দামের পসরা—হাটGo-তে ঘরে বসেই ঘুরে দেখুন।',
  openGraph: {
    title: 'হাটGo | বাংলার ডিজিটাল হাট',
    description: 'বাংলার হাটের আমেজ এবার আপনার ঘরে।',
    type: 'website',
    locale: 'bn_BD',
  },
};

const trust = [
  {
    icon: ShoppingBag,
    title: '১. পণ্য পছন্দ করুন',
    detail: 'দাম, ছবি ও নমুনা ভ্যারিয়েন্ট দেখুন',
  },
  { icon: ShoppingCart, title: '২. কার্টে রাখুন', detail: 'ভ্যারিয়েন্ট ও পরিমাণ মিলিয়ে নিন' },
  { icon: ClipboardList, title: '৩. Checkout দেখুন', detail: 'ফর্মটি নমুনা অর্ডারের জন্য' },
  { icon: Info, title: 'এটি demo storefront', detail: 'অর্ডার বিক্রেতার কাছে পৌঁছায় না' },
];

const reviews = [
  {
    name: 'সাবিহা রহমান',
    place: 'ধানমন্ডি, ঢাকা',
    text: 'নকশি ব্যাগটা হাতে পেয়ে মনে হলো কারিগরের গল্পটাও সঙ্গে পেলাম। কাজ আর প্যাকেট—দুটোই দারুণ!',
    tilt: '-2deg',
  },
  {
    name: 'রাকিবুল হাসান',
    place: 'রাজশাহী',
    text: 'আমের আচার একদম ঘরের স্বাদ। অর্ডার থেকে ডেলিভারি পর্যন্ত খবর পেয়েছি, আবার নেব নিশ্চয়ই।',
    tilt: '1.5deg',
  },
  {
    name: 'নুসরাত জাহান',
    place: 'সিলেট',
    text: 'মাটির কাপগুলো সুন্দর, আর ভাঙার ভয় ছাড়াই যত্ন করে পাঠিয়েছে। ছোট ব্যবসার এমন আয়োজন ভালো লাগে।',
    tilt: '-1deg',
  },
];

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getCatalogProducts();
  const tickerProducts = [...products.slice(0, 8), ...products.slice(0, 8)];
  return (
    <main>
      <HeroBoard />
      <section aria-label="হাটGo-তে কেনাকাটার সুবিধা" className="trust-strip">
        <Container className="grid grid-cols-2 gap-3 py-5 sm:grid-cols-4 sm:gap-4 sm:py-7">
          {trust.map(({ icon: Icon, title, detail }, index) => (
            <div className={`trust-stamp trust-stamp-${index + 1}`} key={title}>
              <Icon aria-hidden="true" className="size-5 shrink-0 text-haat-brick" />
              <div>
                <h2 className="text-sm font-bold leading-5 text-haat-green">{title}</h2>
                <p className="mt-1 text-xs text-haat-muted">{detail}</p>
              </div>
            </div>
          ))}
        </Container>
      </section>

      <section className="py-14 sm:py-20" id="shops">
        <Container>
          <SectionHeading
            eyebrow="আপনার পাড়ার দোকান"
            description="যে দোকানে মন চায় ঢুঁ মারুন—সব পসরা এক হাটে।"
          >
            দোকান ঘুরে পছন্দ করুন
          </SectionHeading>
          <div className="category-grid">
            {categories.map((category, index) => (
              <Link
                className={`category-sign category-sign-${index + 1}`}
                href={`/category/${category.slug}`}
                key={category.slug}
                style={{ '--shop-color': category.color } as React.CSSProperties}
              >
                <span className="shop-index">দোকান নং ০{index + 1}</span>
                <span aria-hidden="true" className="shop-glyph">
                  {['ফ', 'ই', 'গ্র', 'ঘ', 'ব', 'বই', 'খে', 'হা'][index]}
                </span>
                <h3>{category.nameBn}</h3>
                <p>{category.nameEn}</p>
                <span className="shop-note">{category.note}</span>
                <span aria-hidden="true" className="shop-arrow">
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="ticker-title" className="ticker-section">
        <div className="ticker-label">
          <h2 id="ticker-title">আজকের হাট</h2>
          <span>দেখুন কার কী পসরা</span>
        </div>
        <div className="ticker-viewport">
          <div className="ticker-track">
            {tickerProducts.map((product, index) => (
              <span className="ticker-item" key={`${product.id}-${index}`}>
                <strong>{product.nameBn}</strong>
                <span>{formatBDT(product.price)}</span>
                <span aria-hidden="true" className="ticker-flower">
                  ✳
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <Container>
          <div className="flash-heading">
            <SectionHeading
              eyebrow="আজকের দরদাম"
              description="এখানে দেখানো দাম ও ছাড় নমুনা; কেনার আগে বিক্রেতার সঙ্গে নিশ্চিত করুন।"
            >
              নমুনা ছাড়
            </SectionHeading>
            <p
              className="mb-4 inline-block rotate-1 border border-dashed border-haat-brick bg-haat-paper px-3 py-2 text-xs font-bold text-haat-brick md:mb-0"
              role="note"
            >
              নমুনা ছাড় · আসল offer বা countdown নয়
            </p>
          </div>
          <div className="product-row">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#f5e9d4] py-14 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="হাটের সেরা পসরা"
            description="নতুন এসেছে, সবার পছন্দ হয়েছে, কিংবা আজকের বিশেষ অফার—বেছে নিন আপনার মতো করে।"
          >
            আপনার জন্য বাছাই
          </SectionHeading>
          <FeaturedTabs products={products} />
        </Container>
      </section>

      <section className="story-section py-14 sm:py-20" id="our-story">
        <Container>
          <div className="story-card">
            <div className="story-seal" aria-hidden="true">
              হাটের
              <br />
              কথা
            </div>
            <p className="mb-2 text-sm font-bold text-haat-brick">আমাদের ছোট্ট গল্প</p>
            <h2 className="font-display text-2xl font-bold leading-snug text-haat-green sm:text-3xl">
              হাটGo কেন?
            </h2>
            <p className="mt-4 max-w-3xl font-display text-lg leading-9 text-haat-charcoal/80 sm:text-xl">
              বাংলার হাটে শুধু কেনাবেচা হয় না—হয় পরিচয়, আড্ডা, আর মানুষের পরিশ্রমের কদর। সেই চেনা
              আন্তরিকতাকে সবার ঘরে পৌঁছে দিতে হাটGo। দেশের ছোট দোকান, কৃষক আর কারিগরের পসরা এক
              জায়গায় এনে আমরা চাই প্রতিটি কেনাকাটায় থাকুক ন্যায্য দাম আর আপন মানুষের গল্প।
            </p>
            <p className="mt-5 font-display text-base font-bold text-haat-brick">
              — হাটের মানুষ, হাটGo
            </p>
          </div>
        </Container>
      </section>

      <section className="review-board py-14 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="হাটের ক্রেতারা বলছেন"
            description="নিচের কথাগুলো শুধু ডিজাইন preview-এর নমুনা—বাস্তব ক্রেতার review নয়।"
          >
            ক্রেতাদের মনের কথা
          </SectionHeading>
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((review, index) => (
              <figure
                className={`review-note review-note-${index + 1}`}
                key={review.name}
                style={{ '--note-tilt': review.tilt } as React.CSSProperties}
              >
                <div aria-hidden="true" className="note-pin" />
                <div className="mb-3 flex gap-1" aria-label="৫ এর মধ্যে ৫ তারা">
                  {Array.from({ length: 5 }, (_, star) => (
                    <span aria-hidden="true" className="text-haat-marigold" key={star}>
                      ★
                    </span>
                  ))}
                </div>
                <blockquote className="font-display text-base leading-7 text-haat-charcoal/85">
                  “{review.text}”
                </blockquote>
                <figcaption className="mt-5 border-t border-dashed border-haat-charcoal/20 pt-3">
                  <strong className="text-haat-green">{review.name}</strong>
                  <span className="ml-2 text-sm text-haat-muted">{review.place}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-14 sm:pb-20">
        <Container>
          <div className="newsletter-panel">
            <div>
              <p className="text-sm font-bold text-haat-marigold">হাটের খবর রাখুন</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
                নতুন পসরা আর অফারের খবর সবার আগে
              </h2>
              <p className="mt-2 max-w-xl leading-7 text-white/80">
                মাসে কয়েকটি চিঠি—নতুন দোকান, ভালো পণ্য আর হাটের গল্প নিয়ে।
              </p>
            </div>
            <div className="newsletter-form-wrap">
              <NewsletterForm />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
