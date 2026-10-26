'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { selectCartCount, useShopStore } from '@/lib/store';
import { categories as shopCategories } from '@/lib/mock/categories';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useShopStore(selectCartCount);
  const wishlistCount = useShopStore((state) => state.wishlist.length);
  const hydrated = useShopStore((state) => state.hasHydrated);

  return (
    <header className="sticky top-0 z-40 border-b border-haat-charcoal/10 bg-haat-paper/95 backdrop-blur-sm">
      <Container className="py-3 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="-ml-2 inline-flex size-11 shrink-0 items-center justify-center rounded-md text-haat-green hover:bg-haat-green/10 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>

          <Link aria-label="হাটGo home" className="group flex shrink-0 items-center gap-2" href="/">
            <span className="relative grid size-10 place-items-center rounded-[40%_55%_44%_52%] border-2 border-haat-green bg-haat-marigold font-display text-xl font-bold text-haat-green shadow-[2px_3px_0_var(--green)] sm:size-11 sm:text-2xl">
              হা
            </span>
            <span className="font-display text-[1.65rem] font-bold leading-none tracking-tight text-haat-green sm:text-3xl">
              হাট<span className="text-haat-brick">Go</span>
            </span>
          </Link>

          <form action="/search" className="hidden min-w-0 flex-1 md:block" role="search">
            <label className="sr-only" htmlFor="site-search">
              পণ্য খুঁজুন
            </label>
            <div className="flex h-11 items-center rounded-md border border-haat-green/30 bg-white/70 pl-3 transition focus-within:border-haat-green focus-within:ring-2 focus-within:ring-haat-marigold/70">
              <Search aria-hidden="true" className="size-5 shrink-0 text-haat-green" />
              <input
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-haat-muted"
                id="site-search"
                name="q"
                placeholder="কী খুঁজছেন আজ?"
                type="search"
              />
              <button
                className="h-full rounded-r-[5px] bg-haat-green px-4 text-sm font-semibold text-white transition hover:bg-haat-green-deep"
                type="submit"
              >
                খুঁজুন
              </button>
            </div>
          </form>

          <nav
            aria-label="Account and shopping"
            className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3"
          >
            <Link
              aria-label={`পছন্দের তালিকা, ${hydrated ? wishlistCount : 0}টি পণ্য`}
              className="relative grid size-10 place-items-center rounded-md text-haat-green transition hover:bg-haat-green/10"
              href="/wishlist"
            >
              <Heart aria-hidden="true" className="size-5" />
              <span className="absolute right-0 top-0 grid size-[18px] place-items-center rounded-full bg-haat-marigold text-[10px] font-bold text-haat-green">
                {hydrated ? wishlistCount : 0}
              </span>
            </Link>
            <Link
              aria-label={`Cart, ${hydrated ? cartCount : 0} items`}
              className="relative grid size-10 place-items-center rounded-md text-haat-green transition hover:bg-haat-green/10"
              href="/cart"
            >
              <ShoppingBag aria-hidden="true" className="size-5" />
              <span className="absolute right-0 top-0 grid size-[18px] place-items-center rounded-full bg-haat-brick text-[10px] font-bold text-white">
                {hydrated ? cartCount : 0}
              </span>
            </Link>
            <Link
              aria-label="লগইন / অ্যাকাউন্ট"
              className="hidden items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold text-haat-green transition hover:bg-haat-green/10 sm:flex"
              href="/account/orders"
            >
              <UserRound aria-hidden="true" className="size-5" />
              <span>আমার অর্ডার</span>
            </Link>
          </nav>
        </div>

        <form action="/search" className="mt-3 md:hidden" role="search">
          <label className="sr-only" htmlFor="mobile-search">
            পণ্য খুঁজুন
          </label>
          <div className="flex h-10 items-center rounded-md border border-haat-green/30 bg-white/70 pl-3 focus-within:ring-2 focus-within:ring-haat-marigold/70">
            <Search aria-hidden="true" className="size-4 shrink-0 text-haat-green" />
            <input
              className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-haat-muted"
              id="mobile-search"
              name="q"
              placeholder="কী খুঁজছেন আজ?"
              type="search"
            />
            <button
              aria-label="Search"
              className="h-full rounded-r-[5px] bg-haat-green px-3 text-white"
              type="submit"
            >
              <Search aria-hidden="true" className="size-4" />
            </button>
          </div>
        </form>

        <nav
          aria-label="Product categories"
          className="hidden items-center gap-7 pt-4 text-sm font-semibold text-haat-charcoal lg:flex"
        >
          {shopCategories.slice(0, 5).map((category) => (
            <Link
              className="transition-colors hover:text-haat-brick"
              href={`/category/${category.slug}`}
              key={category.slug}
            >
              {category.nameBn}
            </Link>
          ))}
          <Link className="ml-auto text-haat-brick hover:underline" href="/offers">
            আজকের অফার
          </Link>
        </nav>

        {menuOpen ? (
          <nav
            aria-label="Mobile categories"
            className="absolute inset-x-0 top-full border-b border-haat-charcoal/10 bg-haat-paper shadow-lg lg:hidden"
            id="mobile-navigation"
          >
            <div className="mx-auto flex max-w-[var(--content-width)] flex-col px-4 py-3 sm:px-6">
              <Link
                className="rounded-md px-3 py-3 font-semibold text-haat-green hover:bg-haat-green/10 sm:hidden"
                href="/account/orders"
                onClick={() => setMenuOpen(false)}
              >
                আমার অর্ডার
              </Link>
              {shopCategories.map((category) => (
                <Link
                  className="rounded-md px-3 py-3 font-semibold hover:bg-haat-green/10"
                  href={`/category/${category.slug}`}
                  key={category.slug}
                  onClick={() => setMenuOpen(false)}
                >
                  {category.nameBn}
                </Link>
              ))}
              <Link
                className="rounded-md px-3 py-3 font-semibold text-haat-brick hover:bg-haat-brick/5"
                href="/offers"
                onClick={() => setMenuOpen(false)}
              >
                আজকের অফার
              </Link>
            </div>
          </nav>
        ) : null}
      </Container>
    </header>
  );
}
