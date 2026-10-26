'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Heart, Minus, Plus, Tag, Trash2 } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { ProductImage } from '@/components/product/ProductImage';
import { formatBDT } from '@/lib/formatBDT';
import { FREE_DELIVERY_THRESHOLD, getPricingQuote } from '@/lib/pricing';
import { selectCartCount, useShopStore } from '@/lib/store';

export function CartPageClient() {
  const cart = useShopStore((state) => state.cart);
  const wishlist = useShopStore((state) => state.wishlist);
  const couponCode = useShopStore((state) => state.couponCode);
  const hydrated = useShopStore((state) => state.hasHydrated);
  const count = useShopStore(selectCartCount);
  const setQuantity = useShopStore((state) => state.setCartQuantity);
  const remove = useShopStore((state) => state.removeCartLine);
  const moveToWishlist = useShopStore((state) => state.moveToWishlist);
  const setCouponCode = useShopStore((state) => state.setCouponCode);
  const [couponDraft, setCouponDraft] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [couponError, setCouponError] = useState(false);
  const quote = useMemo(
    () =>
      getPricingQuote(
        cart.map(({ productId, quantity, variantLabel }) => ({
          productId,
          quantity,
          variantLabel,
        })),
        couponCode,
        'inside-dhaka',
      ),
    [cart, couponCode],
  );

  useEffect(() => {
    if (!hydrated) void useShopStore.persist.rehydrate();
  }, [hydrated]);
  useEffect(() => setCouponDraft(couponCode), [couponCode]);

  function applyCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = couponDraft.trim().toUpperCase();
    const nextQuote = getPricingQuote(
      cart.map(({ productId, quantity, variantLabel }) => ({
        productId,
        quantity,
        variantLabel,
      })),
      code,
      'inside-dhaka',
    );
    if (!code) {
      setCouponMessage('কুপন কোডটি লিখুন।');
      setCouponError(true);
      return;
    }
    if (nextQuote.couponError) {
      setCouponMessage(nextQuote.couponError);
      setCouponError(true);
      return;
    }
    setCouponCode(code);
    setCouponMessage(`“${code}” কুপনটি যোগ হয়েছে।`);
    setCouponError(false);
  }

  function removeCoupon() {
    setCouponCode('');
    setCouponDraft('');
    setCouponMessage('কুপন সরানো হয়েছে।');
    setCouponError(false);
  }

  if (!hydrated) {
    return (
      <main className="cart-page">
        <Container>
          <p aria-live="polite">আপনার কার্ট দেখা হচ্ছে…</p>
        </Container>
      </main>
    );
  }

  const progress =
    quote.deliveryCharge === 0
      ? 100
      : Math.min(100, (quote.subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  return (
    <main className="cart-page">
      <Container>
        <Breadcrumbs items={[{ label: 'হোম', href: '/' }, { label: 'কার্ট' }]} />
        <div className="cart-heading-row">
          <div>
            <p className="listing-eyebrow">আপনার কেনাকাটা</p>
            <h1>বাজারের ঝুড়ি</h1>
            <p className="text-sm text-haat-muted">
              {count.toLocaleString('bn-BD')}টি পণ্য আপনার ঝুড়িতে
            </p>
          </div>
          <Link className="cart-back-link" href="/products">
            হাট ঘুরে দেখি <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        {cart.length ? (
          <>
            <section
              aria-label="ফ্রি ডেলিভারির অগ্রগতি"
              className="delivery-progress cart-delivery-progress"
            >
              <div className="flex items-center justify-between gap-3">
                <p>
                  {quote.deliveryCharge === 0
                    ? 'দারুণ! এই অর্ডারে ডেলিভারি ফ্রি।'
                    : `${formatBDT(FREE_DELIVERY_THRESHOLD - quote.subtotal)} টাকার বাজার করলেই ডেলিভারি ফ্রি`}
                </p>
                <span className="font-display text-xs font-extrabold">৳ ১,৫০০</span>
              </div>
              <div
                aria-label={`ফ্রি ডেলিভারির ${Math.round(progress)} শতাংশ পূরণ`}
                className="h-2 overflow-hidden rounded-full bg-haat-green/10"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
              >
                <span
                  className="block h-full rounded-full bg-haat-marigold transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </section>
            <div className="cart-page-layout">
              <ul className="cart-page-lines">
                {cart.map((line) => {
                  const pricedItem = quote.items.find(
                    (item) =>
                      item.productId === line.productId && item.variantLabel === line.variantLabel,
                  );
                  const displayQuantity = pricedItem?.quantity ?? line.quantity;
                  return (
                    <li className="cart-line cart-page-line" key={line.id}>
                      <ProductImage
                        className="cart-line-image"
                        name={line.nameBn}
                        variant={line.image}
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          className="font-bold text-haat-green hover:text-haat-brick"
                          href={`/products/${line.slug}`}
                        >
                          {line.nameBn}
                        </Link>
                        {line.variantLabel ? (
                          <p className="mt-1 text-sm text-haat-muted">{line.variantLabel}</p>
                        ) : null}
                        <p className="mt-2 font-bold">
                          {pricedItem ? formatBDT(pricedItem.price) : 'এই বিকল্পটি স্টকে নেই'}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <div aria-label={`${line.nameBn} পরিমাণ`} className="quantity-stepper">
                            <button
                              aria-label="একটি কমান"
                              disabled={displayQuantity <= 1}
                              onClick={() => setQuantity(line.id, displayQuantity - 1)}
                              type="button"
                            >
                              <Minus aria-hidden="true" className="size-4" />
                            </button>
                            <output aria-live="polite">
                              {displayQuantity.toLocaleString('bn-BD')}
                            </output>
                            <button
                              aria-label="একটি বাড়ান"
                              disabled={displayQuantity >= line.stock}
                              onClick={() => setQuantity(line.id, displayQuantity + 1)}
                              type="button"
                            >
                              <Plus aria-hidden="true" className="size-4" />
                            </button>
                          </div>
                          <button
                            className="cart-text-action"
                            onClick={() => moveToWishlist(line.id)}
                            type="button"
                          >
                            <Heart aria-hidden="true" className="size-4" />
                            {wishlist.includes(line.productId)
                              ? 'পছন্দের তালিকায় আছে'
                              : 'পছন্দের তালিকায় রাখুন'}
                          </button>
                          <button
                            className="cart-text-action cart-remove-action"
                            onClick={() => remove(line.id)}
                            type="button"
                          >
                            <Trash2 aria-hidden="true" className="size-4" /> সরান
                          </button>
                        </div>
                      </div>
                      <strong className="cart-line-total">
                        {pricedItem ? formatBDT(pricedItem.lineTotal) : '—'}
                      </strong>
                    </li>
                  );
                })}
              </ul>
              <aside aria-labelledby="cart-summary-title" className="cart-page-summary">
                <h2 id="cart-summary-title">অর্ডারের সারাংশ</h2>
                <div className="coupon-box">
                  <p className="coupon-title">
                    <Tag aria-hidden="true" className="size-4" /> হাটের কুপন
                  </p>
                  <form className="coupon-form" onSubmit={applyCoupon}>
                    <label className="sr-only" htmlFor="cart-coupon">
                      কুপন কোড
                    </label>
                    <input
                      autoComplete="off"
                      id="cart-coupon"
                      maxLength={20}
                      onChange={(event) => setCouponDraft(event.target.value)}
                      placeholder="কুপন কোড লিখুন"
                      value={couponDraft}
                    />
                    {couponCode ? (
                      <button className="coupon-apply" onClick={removeCoupon} type="button">
                        সরান
                      </button>
                    ) : (
                      <button className="coupon-apply" type="submit">
                        প্রয়োগ
                      </button>
                    )}
                  </form>
                  <p
                    aria-live="polite"
                    className={
                      couponError || quote.couponError ? 'coupon-message error' : 'coupon-message'
                    }
                  >
                    {quote.couponError ||
                      couponMessage ||
                      (couponCode
                        ? `“${couponCode}” কুপন প্রয়োগ করা আছে।`
                        : 'HAAT10, FREESHIP অথবা NEW50 ব্যবহার করুন।')}
                  </p>
                </div>
                <div className="cart-summary-row">
                  <span>পণ্যের দাম</span>
                  <span>{formatBDT(quote.subtotal)}</span>
                </div>
                {quote.discount > 0 ? (
                  <div className="cart-summary-row discount-row">
                    <span>কুপন ছাড়</span>
                    <span>− {formatBDT(quote.discount)}</span>
                  </div>
                ) : null}
                <div className="cart-summary-row">
                  <span>
                    ডেলিভারি <small>(ঢাকা, আনুমানিক)</small>
                  </span>
                  <span>{quote.deliveryCharge ? formatBDT(quote.deliveryCharge) : 'ফ্রি'}</span>
                </div>
                <div aria-live="polite" className="cart-summary-total">
                  <span>মোট</span>
                  <strong>{formatBDT(quote.total)}</strong>
                </div>
                <p className="cart-summary-note">
                  ঠিকানা দিলে ডেলিভারি চার্জ চূড়ান্ত হবে। ৳ ১,৫০০ বা তার বেশি বাজারে ডেলিভারি ফ্রি।
                </p>
                <Link className="cart-checkout-button" href="/checkout">
                  চেকআউটে যান <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
                <Link className="cart-wishlist-link" href="/wishlist">
                  পছন্দের তালিকা দেখুন ({wishlist.length.toLocaleString('bn-BD')})
                </Link>
              </aside>
            </div>
          </>
        ) : (
          <div className="listing-empty cart-empty-state">
            <span aria-hidden="true" className="cart-empty-stamp">
              ঝুড়ি খালি
            </span>
            <p className="listing-eyebrow">আজকের হাটে কত পসরা!</p>
            <h2>আপনার ঝুড়ির জন্য কিছু খুঁজে নিন</h2>
            <p>কারিগরের কাজ, টাটকা বাজার আর পছন্দের জিনিস—সব এক হাটে।</p>
            <Link href="/products">
              পণ্য দেখুন <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        )}
      </Container>
    </main>
  );
}
