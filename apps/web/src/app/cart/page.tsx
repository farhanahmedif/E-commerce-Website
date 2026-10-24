'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { formatBDT } from '@/lib/formatBDT';
import { selectCartCount, useShopStore } from '@/lib/store';
import { ProductImage } from '@/components/product/ProductImage';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function CartPage() {
  const cart = useShopStore((state) => state.cart);
  const hydrated = useShopStore((state) => state.hasHydrated);
  const count = useShopStore(selectCartCount);
  const setQuantity = useShopStore((state) => state.setCartQuantity);
  const remove = useShopStore((state) => state.removeCartLine);
  const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  useEffect(() => {
    if (!hydrated) void useShopStore.persist.rehydrate();
  }, [hydrated]);
  if (!hydrated)
    return (
      <main className="listing-page">
        <Container>
          <p aria-live="polite">আপনার কার্ট দেখা হচ্ছে…</p>
        </Container>
      </main>
    );
  return (
    <main className="cart-page">
      <Container>
        <Breadcrumbs items={[{ label: 'হোম', href: '/' }, { label: 'কার্ট' }]} />
        <p className="listing-eyebrow">আপনার কেনাকাটা</p>
        <h1>বাজারের ঝুড়ি</h1>
        {cart.length ? (
          <div className="cart-page-layout">
            <ul className="cart-page-lines">
              {cart.map((line) => (
                <li className="cart-line" key={line.id}>
                  <ProductImage
                    className="cart-line-image"
                    name={line.nameBn}
                    variant={line.image}
                  />
                  <div className="min-w-0 flex-1">
                    <Link className="font-bold text-haat-green" href={`/products/${line.slug}`}>
                      {line.nameBn}
                    </Link>
                    <p className="mt-1 text-sm text-haat-muted">{line.variantLabel}</p>
                    <p className="mt-2 font-bold">{formatBDT(line.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        aria-label="একটি কমান"
                        className="grid size-8 place-items-center rounded border"
                        onClick={() => setQuantity(line.id, line.quantity - 1)}
                        type="button"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        aria-label="একটি বাড়ান"
                        className="grid size-8 place-items-center rounded border"
                        disabled={line.quantity >= line.stock}
                        onClick={() => setQuantity(line.id, line.quantity + 1)}
                        type="button"
                      >
                        <Plus className="size-4" />
                      </button>
                      <button
                        aria-label="কার্ট থেকে সরান"
                        className="ml-2 text-haat-brick"
                        onClick={() => remove(line.id)}
                        type="button"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <aside className="cart-page-summary">
              <h2>অর্ডারের সারাংশ</h2>
              <p>{count.toLocaleString('bn-BD')}টি পণ্য</p>
              <div className="flex justify-between font-bold">
                <span>সাবটোটাল</span>
                <span>{formatBDT(subtotal)}</span>
              </div>
              <p className="text-sm text-haat-muted">ডেলিভারি চার্জ ঠিকানার ভিত্তিতে যোগ হবে।</p>
              <p className="text-sm text-haat-muted">ক্যাশ অন ডেলিভারি ও অন্যান্য সুবিধার তথ্য পণ্যের পাতায় দেখে নিন।</p>
            </aside>
          </div>
        ) : (
          <div className="listing-empty">
            <h2>ঝুড়ি এখনো খালি</h2>
            <p>হাট ঘুরে পছন্দের পণ্য যোগ করুন।</p>
            <Link href="/products">পণ্য দেখুন</Link>
          </div>
        )}
      </Container>
    </main>
  );
}
