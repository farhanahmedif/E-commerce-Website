'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { formatBDT } from '@/lib/formatBDT';
import { FREE_DELIVERY_THRESHOLD, getPricingQuote } from '@/lib/pricing';
import { useShopStore } from '@/lib/store';
import { ProductImage } from '@/components/product/ProductImage';

export function CartExperience() {
  const drawerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = useShopStore((state) => state.cartDrawerOpen);
  const hydrated = useShopStore((state) => state.hasHydrated);
  const cart = useShopStore((state) => state.cart);
  const couponCode = useShopStore((state) => state.couponCode);
  const setOpen = useShopStore((state) => state.setCartDrawerOpen);
  const setQuantity = useShopStore((state) => state.setCartQuantity);
  const removeLine = useShopStore((state) => state.removeCartLine);
  useEffect(() => {
    if (!hydrated) void useShopStore.persist.rehydrate();
  }, [hydrated]);
  useEffect(() => {
    if (!open) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !drawerRef.current) return;
      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href],input:not([disabled])',
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', handleKeys);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener('keydown', handleKeys);
      previousFocus?.focus();
    };
  }, [open, setOpen]);
  if (!open) return null;
  const quote = getPricingQuote(
    cart.map(({ productId, quantity, variantLabel }) => ({ productId, quantity, variantLabel })),
    couponCode,
    'inside-dhaka',
  );
  const subtotal = quote.subtotal;
  const deliveryThreshold = FREE_DELIVERY_THRESHOLD;
  const progress =
    quote.deliveryCharge === 0 ? 100 : Math.min(100, (subtotal / deliveryThreshold) * 100);
  return (
    <div
      className="cart-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <section
        aria-labelledby="cart-drawer-title"
        aria-modal="true"
        className="cart-drawer"
        ref={drawerRef}
        role="dialog"
      >
        <header className="flex items-center justify-between border-b border-haat-green/15 px-5 py-4">
          <div>
            <p className="text-xs font-bold text-haat-brick">আপনার বাজারের ঝুড়ি</p>
            <h2 className="font-display text-xl font-bold text-haat-green" id="cart-drawer-title">
              কার্টে {cart.length} ধরনের পণ্য
            </h2>
          </div>
          <button
            aria-label="কার্ট বন্ধ করুন"
            className="grid size-10 place-items-center rounded-full hover:bg-haat-green/10"
            onClick={() => setOpen(false)}
            ref={closeRef}
            type="button"
          >
            <X aria-hidden="true" />
          </button>
        </header>
        <div className="delivery-progress">
          <p>
            {quote.deliveryCharge === 0
              ? 'দারুণ! আপনার ডেলিভারি ফ্রি।'
              : `${formatBDT(deliveryThreshold - subtotal)} টাকার বাজার করলেই ডেলিভারি ফ্রি`}
          </p>
          <div
            aria-label={`ফ্রি ডেলিভারির ${Math.round(progress)} শতাংশ পূরণ`}
            className="h-2 overflow-hidden rounded-full bg-haat-green/10"
          >
            <span
              className="block h-full rounded-full bg-haat-marigold transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {cart.length === 0 ? (
          <div className="cart-empty">
            <span className="grid size-16 place-items-center rounded-full bg-haat-green/10 text-haat-green">
              <ShoppingBag aria-hidden="true" className="size-8" />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold text-haat-green">ঝুড়ি এখনো খালি</h3>
            <p className="mt-2 max-w-xs text-center text-sm text-haat-muted">
              হাট ঘুরে পছন্দের জিনিসগুলো এখানে জমা করুন।
            </p>
            <button
              className="mt-5 rounded bg-haat-green px-5 py-3 font-bold text-white"
              onClick={() => setOpen(false)}
              type="button"
            >
              হাট ঘুরে দেখি
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {cart.map((line) => {
                const pricedItem = quote.items.find(
                  (item) =>
                    item.productId === line.productId && item.variantLabel === line.variantLabel,
                );
                const displayQuantity = pricedItem?.quantity ?? line.quantity;
                return (
                  <li className="cart-line" key={line.id}>
                    <ProductImage
                      className="cart-line-image"
                      name={line.nameBn}
                      variant={line.image}
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        className="font-bold text-haat-green hover:text-haat-brick"
                        href={`/products/${line.slug}`}
                        onClick={() => setOpen(false)}
                      >
                        {line.nameBn}
                      </Link>
                      {line.variantLabel ? (
                        <p className="mt-1 text-xs text-haat-muted">{line.variantLabel}</p>
                      ) : null}
                      <p className="mt-1 font-display font-bold">
                        {pricedItem ? formatBDT(pricedItem.price) : 'এই বিকল্পটি স্টকে নেই'}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          aria-label={`${line.nameBn} থেকে একটি কমান`}
                          className="grid size-8 place-items-center rounded border border-haat-green/20"
                          disabled={displayQuantity <= 1}
                          onClick={() => setQuantity(line.id, displayQuantity - 1)}
                          type="button"
                        >
                          <Minus aria-hidden="true" className="size-3.5" />
                        </button>
                        <span aria-live="polite" className="min-w-5 text-center">
                          {displayQuantity}
                        </span>
                        <button
                          aria-label={`${line.nameBn} একটি বাড়ান`}
                          className="grid size-8 place-items-center rounded border border-haat-green/20"
                          disabled={!pricedItem || displayQuantity >= line.stock}
                          onClick={() => setQuantity(line.id, displayQuantity + 1)}
                          type="button"
                        >
                          <Plus aria-hidden="true" className="size-3.5" />
                        </button>
                        <button
                          aria-label={`${line.nameBn} সরান`}
                          className="ml-1 grid size-8 place-items-center rounded text-haat-brick hover:bg-haat-brick/10"
                          onClick={() => removeLine(line.id)}
                          type="button"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <footer className="cart-footer">
              <div className="mb-4 flex justify-between font-bold">
                <span>সাবটোটাল</span>
                <span>{formatBDT(subtotal)}</span>
              </div>
              <Link
                className="block rounded bg-haat-green px-5 py-3 text-center font-bold text-white"
                href="/cart"
                onClick={() => setOpen(false)}
              >
                কার্টে যান
              </Link>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
