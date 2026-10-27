'use client';

import Link from 'next/link';
import { Heart, Plus, Star } from 'lucide-react';
import {
  getDefaultVariantSelections,
  getVariantStock,
  getVariantSku,
  getVariantPrice,
  type MockProduct,
} from '@/lib/mock/products';
import { formatBDT } from '@/lib/formatBDT';
import { useShopStore } from '@/lib/store';
import { ProductImage } from './ProductImage';

export function ProductCard({ product }: { product: MockProduct }) {
  const wished = useShopStore((state) => state.wishlist.includes(product.id));
  const addToCart = useShopStore((state) => state.addToCart);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const defaultSelections = getDefaultVariantSelections(product);
  const quickAddStock = getVariantStock(product, defaultSelections);
  const quickAddVariantLabel = product.variants
    .map((variant) => `${variant.name}: ${defaultSelections[variant.name]}`)
    .join(' · ');
  const quickAddVariantSku = getVariantSku(product, defaultSelections);
  const quickAddPrice = getVariantPrice(product, defaultSelections);
  const discount =
    product.oldPrice > quickAddPrice ? Math.round((1 - quickAddPrice / product.oldPrice) * 100) : 0;

  return (
    <article className="product-card group relative min-w-0 rounded-lg border border-haat-green/15 bg-[#fffaf0] p-2.5 sm:p-3">
      <div className="relative overflow-hidden rounded-md">
        <Link aria-label={`${product.nameBn} দেখুন`} href={`/products/${product.slug}`}>
          <ProductImage
            className="product-image"
            imageUrl={product.imageUrls?.[0]}
            name={product.nameBn}
            variant={product.image}
          />
          <ProductImage
            className="product-image product-image-secondary"
            name={`${product.nameBn}, পেছনের দিক`}
            imageUrl={product.imageUrls?.[1] ?? product.imageUrls?.[0]}
            variant={product.image}
            secondary
          />
        </Link>
        <span className="absolute left-2 top-2 -rotate-6 rounded-full border-2 border-haat-brick bg-haat-paper px-2 py-1 text-[10px] font-bold text-haat-brick sm:text-xs">
          {product.badge}
        </span>
        {discount > 0 ? (
          <span className="absolute right-2 top-2 rotate-6 rounded-full bg-haat-brick px-2 py-1 text-[10px] font-extrabold text-white sm:text-xs">
            -{discount}%
          </span>
        ) : null}
        <button
          aria-label={
            wished ? `${product.nameBn} wishlist থেকে সরান` : `${product.nameBn} wishlist-এ রাখুন`
          }
          aria-pressed={wished}
          className={`absolute bottom-2 right-2 grid size-10 place-items-center rounded-full border border-haat-green/15 bg-white shadow-sm transition hover:scale-105 focus-visible:outline-offset-2 ${wished ? 'text-haat-brick' : 'text-haat-green'}`}
          onClick={() => toggleWishlist(product.id)}
          type="button"
        >
          <Heart aria-hidden="true" className="size-5" fill={wished ? 'currentColor' : 'none'} />
        </button>
        <button
          aria-label={`${product.nameBn} কার্টে যোগ করুন`}
          disabled={quickAddStock === 0}
          className="quick-add absolute inset-x-2 bottom-2 flex min-h-10 translate-y-0 items-center justify-center gap-2 rounded bg-haat-green font-semibold text-white shadow transition duration-200 hover:bg-haat-green-deep focus-visible:outline-offset-2 sm:translate-y-14 sm:group-hover:translate-y-0 sm:group-focus-within:translate-y-0"
          onClick={() =>
            addToCart(
              product,
              1,
              quickAddVariantLabel,
              quickAddStock,
              quickAddVariantSku,
              quickAddPrice,
            )
          }
          type="button"
        >
          {quickAddStock === 0 ? (
            'আপাতত স্টকে নেই'
          ) : (
            <>
              <Plus aria-hidden="true" className="size-4" /> দ্রুত কার্টে নিন
            </>
          )}
        </button>
      </div>
      <div className="px-1 pb-1 pt-3">
        <p className="truncate text-xs text-haat-muted">{product.nameEn}</p>
        <h3 className="mt-1 min-h-12 font-display text-[15px] font-bold leading-6 text-haat-green sm:text-base">
          <Link
            className="rounded-sm hover:text-haat-brick focus-visible:outline-offset-2"
            href={`/products/${product.slug}`}
          >
            {product.nameBn}
          </Link>
        </h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-haat-charcoal/75">
          <Star aria-hidden="true" className="size-3.5 fill-haat-marigold text-haat-marigold" />
          <span>{product.rating.toFixed(1)}</span>
          <span className="text-haat-muted">({product.reviewCount})</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="price-tag font-display font-bold text-haat-charcoal">
            {formatBDT(quickAddPrice)}
          </span>
          {product.oldPrice > quickAddPrice ? (
            <span className="text-xs text-haat-muted line-through">
              {formatBDT(product.oldPrice)}
            </span>
          ) : null}
        </div>
        {product.stock === 0 ? (
          <p className="mt-2 inline-block -rotate-1 bg-haat-charcoal px-2 py-0.5 text-xs font-semibold text-haat-paper">
            আপাতত স্টকে নেই
          </p>
        ) : product.stock < 5 ? (
          <p className="mt-2 inline-block -rotate-1 bg-haat-charcoal px-2 py-0.5 text-xs font-semibold text-haat-paper">
            আর মাত্র {product.stock}টি!
          </p>
        ) : null}
      </div>
    </article>
  );
}
