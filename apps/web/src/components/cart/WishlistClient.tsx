'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Heart, Trash2 } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { Container } from '@/components/ui/Container';
import { products } from '@/lib/mock/products';
import { useShopStore } from '@/lib/store';

export function WishlistClient() {
  const ids = useShopStore((state) => state.wishlist);
  const hydrated = useShopStore((state) => state.hasHydrated);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const wishedProducts = useMemo(
    () => ids.flatMap((id) => products.filter((product) => product.id === id)),
    [ids],
  );
  useEffect(() => {
    if (!hydrated) void useShopStore.persist.rehydrate();
  }, [hydrated]);

  return (
    <main className="wishlist-page">
      <Container>
        <p className="listing-eyebrow">আপনার পছন্দের পসরা</p>
        <h1 className="wishlist-title">পছন্দের তালিকা</h1>
        {!hydrated ? (
          <p aria-live="polite">তালিকাটি খোলা হচ্ছে…</p>
        ) : wishedProducts.length ? (
          <>
            <p className="wishlist-intro">
              {wishedProducts.length.toLocaleString('bn-BD')}টি পণ্য পরে দেখার জন্য রেখেছেন।
            </p>
            <div className="wishlist-grid">
              {wishedProducts.map((product) => (
                <article className="wishlist-item" key={product.id}>
                  <ProductCard product={product} />
                  <button
                    className="wishlist-remove"
                    onClick={() => toggleWishlist(product.id)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" className="size-4" /> তালিকা থেকে সরান
                  </button>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="listing-empty wishlist-empty">
            <Heart aria-hidden="true" className="size-10 text-haat-brick" />
            <p className="listing-eyebrow">পছন্দের দোকানে কিছুই নেই</p>
            <h2>ভালো লাগা পণ্য এখানে তুলে রাখুন</h2>
            <p>পণ্যের ছবির পাশে থাকা হৃদয় চিহ্নে চাপ দিলেই পরে খুঁজে পাবেন।</p>
            <Link href="/products">হাট ঘুরে পণ্য দেখুন</Link>
          </div>
        )}
      </Container>
    </main>
  );
}
