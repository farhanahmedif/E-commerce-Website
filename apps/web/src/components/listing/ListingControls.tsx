'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type { Category } from '@/lib/mock/categories';
import type { MockProduct } from '@/lib/mock/products';

type Filters = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  rating?: number;
  size?: string;
  color?: string;
  inStock?: boolean;
  onSale?: boolean;
  sort?: string;
};
function FilterFields({
  categories,
  products,
  filters,
  categoryLocked = false,
}: {
  categories: Category[];
  products: MockProduct[];
  filters: Filters;
  categoryLocked?: boolean;
}) {
  const [maxPrice, setMaxPrice] = useState(
    filters.maxPrice ? Math.ceil(filters.maxPrice / 100) : 5000,
  );
  const brands = Array.from(new Set(products.map((product) => product.brand))).sort();
  const sizes = Array.from(
    new Set(
      products.flatMap((product) =>
        product.variants
          .flatMap((variant) => variant.options.map((option) => option.value))
          .filter((value) => ['মাঝারি', 'বড়', 'ছোট', 'এক সাইজ'].includes(value)),
      ),
    ),
  );
  const colors = Array.from(
    new Set(
      products.flatMap((product) =>
        product.variants
          .filter((variant) => variant.name === 'রং')
          .flatMap((variant) => variant.options.map((option) => option.value)),
      ),
    ),
  );
  return (
    <>
      {categoryLocked ? (
        <input name="category" type="hidden" value={filters.category ?? ''} />
      ) : (
        <label className="filter-field">
          <span>দোকান</span>
          <select defaultValue={filters.category ?? ''} name="category">
            <option value="">সব দোকান</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.nameBn}
              </option>
            ))}
          </select>
        </label>
      )}
      <fieldset className="filter-group">
        <legend>দামের সীমা (৳)</legend>
        <div className="price-inputs">
          <label>
            <span className="sr-only">সর্বনিম্ন দাম</span>
            <input
              aria-label="সর্বনিম্ন দাম"
              defaultValue={filters.minPrice ? Math.floor(filters.minPrice / 100) : 0}
              max={5000}
              min={0}
              name="minPrice"
              type="number"
            />
          </label>
          <span aria-hidden="true">–</span>
          <label>
            <span className="sr-only">সর্বোচ্চ দাম</span>
            <input
              aria-label="সর্বোচ্চ দাম"
              max={5000}
              min={0}
              name="maxPrice"
              onChange={(event) => setMaxPrice(Number(event.target.value))}
              type="number"
              value={maxPrice}
            />
          </label>
        </div>
        <input
          aria-label="সর্বোচ্চ দামের স্লাইডার"
          className="price-range"
          max={5000}
          min={0}
          onChange={(event) => setMaxPrice(Number(event.target.value))}
          step={100}
          type="range"
          value={maxPrice}
        />
      </fieldset>
      <label className="filter-field">
        <span>ব্র্যান্ড</span>
        <select defaultValue={filters.brand ?? ''} name="brand">
          <option value="">সব ব্র্যান্ড</option>
          {brands.map((brand) => (
            <option key={brand}>{brand}</option>
          ))}
        </select>
      </label>
      <fieldset className="filter-group">
        <legend>ক্রেতাদের রেটিং</legend>
        {[4, 3].map((rating) => (
          <label className="filter-check" key={rating}>
            <input
              defaultChecked={filters.rating === rating}
              name="rating"
              type="radio"
              value={rating}
            />
            <span>{rating}+ তারা</span>
          </label>
        ))}
      </fieldset>
      {sizes.length > 0 ? (
        <label className="filter-field">
          <span>সাইজ</span>
          <select defaultValue={filters.size ?? ''} name="size">
            <option value="">সব সাইজ</option>
            {sizes.map((size) => (
              <option key={size}>{size}</option>
            ))}
          </select>
        </label>
      ) : null}
      {colors.length > 0 ? (
        <label className="filter-field">
          <span>রং</span>
          <select defaultValue={filters.color ?? ''} name="color">
            <option value="">সব রং</option>
            {colors.map((color) => (
              <option key={color}>{color}</option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="filter-check">
        <input defaultChecked={filters.inStock} name="inStock" type="checkbox" value="true" />
        <span>স্টকে আছে</span>
      </label>
      <label className="filter-check">
        <input defaultChecked={filters.onSale} name="onSale" type="checkbox" value="true" />
        <span>শুধু অফার</span>
      </label>
    </>
  );
}

export function ListingControls({
  action,
  categories,
  products,
  filters,
  categoryLocked = false,
}: {
  action: string;
  categories: Category[];
  products: MockProduct[];
  filters: Filters;
  categoryLocked?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'Tab' && sheetRef.current) {
        const focusable = Array.from(sheetRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled])'));
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = oldOverflow;
      previous?.focus();
    };
  }, [open]);
  function submit(event: FormEvent<HTMLFormElement>) {
    if (
      event.nativeEvent instanceof SubmitEvent &&
      event.nativeEvent.submitter?.getAttribute('data-close') === 'true'
    )
      setOpen(false);
  }
  const fields = (
    <FilterFields
      categories={categories}
      categoryLocked={categoryLocked}
      filters={filters}
      products={products}
    />
  );
  return (
    <>
      <aside aria-label="পণ্য ফিল্টার" className="listing-sidebar">
        <form action={action} className="filter-form" onSubmit={submit}>
          <h2 className="font-display text-xl font-bold text-haat-green">পছন্দ বাছুন</h2>
          {fields}
          <button className="filter-submit" type="submit">
            ফলাফল দেখুন
          </button>
        </form>
      </aside>
      <div className="mobile-filter-trigger">
        <button
          aria-expanded={open}
          className="filter-open"
          onClick={() => setOpen(true)}
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" /> ফিল্টার ও সাজান
        </button>
      </div>
      {open ? (
        <div
          className="filter-sheet-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            aria-labelledby="mobile-filter-title"
            aria-modal="true"
            className="filter-sheet"
            ref={sheetRef}
            role="dialog"
          >
            <header className="flex items-center justify-between border-b border-haat-green/15 p-4">
              <h2
                className="font-display text-lg font-bold text-haat-green"
                id="mobile-filter-title"
              >
                পছন্দ বাছাই করুন
              </h2>
              <button
                aria-label="ফিল্টার বন্ধ করুন"
                className="grid size-10 place-items-center rounded-full hover:bg-haat-green/10"
                onClick={() => setOpen(false)}
                ref={closeRef}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </header>
            <form action={action} className="filter-form filter-form-mobile" onSubmit={submit}>
              {fields}
              <button className="filter-submit" data-close="true" type="submit">
                ফলাফল দেখুন
              </button>
              <a className="filter-clear" href={action}>
                সব মুছুন
              </a>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
